// frontend/scripts.js

let editor; // CKEditor instance
let fullContent = ''; // Store complete document content
let sectionsData = {}; // Store sections mapping
let currentSectionTitle = null; // Track which section is being edited
let editedSections = {}; // Track edited content for each section

const uploadForm = document.getElementById("uploadForm");
const fileInput = document.getElementById("file");
const editorContainer = document.getElementById("editor");
const exportBtn = document.getElementById("exportBtn");
const output = document.getElementById("output");
const sectionsList = document.getElementById("sectionsList");

// Initialize CKEditor
ClassicEditor.create(editorContainer, {
  toolbar: {
    items: [
      'heading', '|', 'bold', 'italic', 'underline', 'link', 'bulletedList', 'numberedList', '|',
      'insertTable', 'imageUpload', '|', 'undo', 'redo'
    ]
  },
  table: { contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ] }
}).then(instance => { editor = instance; }).catch(console.error);

function slugify(text) {
  return (text || '').toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/\-+/g, '-');
}

function addIdsToHeadings(html, sections) {
  // Add id attributes to heading tags matching section titles
  try {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const headings = temp.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    // Create a map of section titles to IDs
    const sectionMap = {};
    if (sections) {
      Object.keys(sections).forEach(title => {
        sectionMap[title.toLowerCase().trim()] = slugify(title);
      });
    }
    
    headings.forEach((h, index) => {
      const title = h.textContent.trim();
      const titleLower = title.toLowerCase();
      
      // Assign ID based on section map or generate from text
      let id = sectionMap[titleLower] || slugify(title);
      
      // Ensure unique ID
      if (temp.querySelector(`#${id}`) && temp.querySelector(`#${id}`) !== h) {
        id = `${id}-${index}`;
      }
      
      h.id = id;
    });
    
    return temp.innerHTML;
  } catch (e) {
    console.error('Error adding IDs to headings:', e);
    return html;
  }
}

function renderSections(sections) {
  sectionsList.innerHTML = '';
  sectionsData = sections; // Store for later use
  
  if (!sections || Object.keys(sections).length === 0) {
    sectionsList.innerHTML = '<li style="padding:8px;color:#64748b;font-size:0.8rem;">No sections detected</li>';
    return;
  }
  
  // Add "Show All" button first
  const allLi = document.createElement('li');
  const allBtn = document.createElement('button');
  allBtn.className = 'section-link active';
  allBtn.textContent = '📄 Full Document';
  allBtn.dataset.sectionId = '__all__';
  allBtn.onclick = () => showFullDocument(allBtn);
  allLi.appendChild(allBtn);
  sectionsList.appendChild(allLi);
  
  // Add section buttons
  Object.keys(sections).forEach((title, idx) => {
    const id = slugify(title);
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.className = 'section-link';
    btn.textContent = title;
    btn.dataset.sectionId = id;
    btn.dataset.sectionTitle = title;
    btn.onclick = () => showSection(title, sections[title], btn);
    li.appendChild(btn);
    sectionsList.appendChild(li);
  });
}

function showFullDocument(btn) {
  if (!editor) return;
  
  // Save current section edits before switching
  saveCurrentSection();
  
  // Remove active class from all buttons
  document.querySelectorAll('.section-link').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  currentSectionTitle = null; // Not editing a specific section
  
  // Reconstruct full document with any edits
  const reconstructed = reconstructFullDocument();
  editor.setData(reconstructed);
}

function showSection(title, content, btn) {
  if (!editor) return;
  
  // Save current section edits before switching
  saveCurrentSection();
  
  // Remove active class from all buttons
  document.querySelectorAll('.section-link').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  currentSectionTitle = title;
  
  // Get content (use edited version if available)
  const sectionContent = editedSections[title] || content;
  
  // Create section-focused view with the heading + content
  const sectionHTML = `
    <h2 style="color: #0078d7; border-bottom: 2px solid #0078d7; padding-bottom: 8px; margin-bottom: 16px;">
      ${title}
    </h2>
    ${sectionContent}
  `;
  
  editor.setData(sectionHTML);
}

function saveCurrentSection() {
  if (!editor || !currentSectionTitle) return;
  
  // Get current editor content
  const currentContent = editor.getData();
  
  // Remove the heading we added for display
  const temp = document.createElement('div');
  temp.innerHTML = currentContent;
  
  // Remove the first h2 (the one we added for section title display)
  const firstH2 = temp.querySelector('h2');
  if (firstH2 && firstH2.textContent.trim() === currentSectionTitle) {
    firstH2.remove();
  }
  
  // Store the edited content (without our display heading)
  editedSections[currentSectionTitle] = temp.innerHTML;
}

function reconstructFullDocument() {
  // Rebuild full document using edited sections or original content
  let reconstructed = '';
  
  Object.keys(sectionsData).forEach(title => {
    // Use edited version if available, otherwise original
    const content = editedSections[title] || sectionsData[title];
    
    // Find the original heading level from fullContent
    const temp = document.createElement('div');
    temp.innerHTML = fullContent;
    const headings = temp.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    let headingTag = 'h2'; // default
    for (const h of headings) {
      if (h.textContent.trim() === title) {
        headingTag = h.tagName.toLowerCase();
        break;
      }
    }
    
    // Add heading + content
    reconstructed += `<${headingTag}>${title}</${headingTag}>`;
    reconstructed += content;
  });
  
  return reconstructed || fullContent;
}

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = fileInput.files[0];
  if (!file) return alert("Please select a file first!");

  const formData = new FormData();
  formData.append("file", file);

  output.textContent = "⏳ Uploading and processing file...";
  if (editor) editor.setData('');
  
  // Reset tracking variables
  currentSectionTitle = null;
  editedSections = {};

  try {
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.error) {
      output.textContent = `❌ Error: ${data.error}`;
      return;
    }
    // Add ids to headings for navigation
    const htmlWithIds = addIdsToHeadings(data.content, data.sections || {});
    fullContent = htmlWithIds; // Store full content
    sectionsData = data.sections || {}; // Store sections
    
    if (editor) editor.setData(htmlWithIds);
    renderSections(data.sections || {});
    output.textContent = "✅ File processed successfully! Click any section in the sidebar to edit it individually.";
  } catch (err) {
    console.error(err);
    output.textContent = "⚠️ Failed to upload or process the file.";
  }
});

exportBtn.addEventListener("click", async () => {
  // Save current section edits before exporting
  saveCurrentSection();
  
  // Reconstruct full document from all sections (including edits)
  const fullHTML = reconstructFullDocument();
  
  if (!fullHTML.trim()) return alert("Editor is empty. Upload and edit a file first.");

  output.textContent = "⏳ Exporting JSON...";

  try {
    // Send as JSON instead of form-data to avoid size limits
    const res = await fetch("/api/export_json", { 
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ html: fullHTML })
    });
    
    const data = await res.json();
    if (data.error) {
      output.textContent = `❌ Error: ${data.error}`;
    } else {
      // Download JSON
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; 
      a.download = `sections_${Date.now()}.json`; 
      a.click();
      URL.revokeObjectURL(url);
      output.textContent = `✅ JSON exported successfully!\n\n${JSON.stringify(data, null, 2)}`;
    }
  } catch (err) {
    console.error(err);
    output.textContent = "⚠️ Failed to export JSON.";
  }
});

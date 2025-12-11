
let user = null;
function showSaveButton(){
	const saveButton = document.getElementById("floating-save-button");
    saveButton.style.display = "block";
 }
 
document.addEventListener("DOMContentLoaded", function () {
    checkUser();
    // Show button only when there's user interaction
    document.getElementById("logsheet-container").addEventListener("input", showSaveButton);
	document.getElementById("addProc-btn").addEventListener("click", showSaveButton);
	document.getElementById("addNote-btn").addEventListener("click", showSaveButton);
	document.getElementById("addAttach-btn").addEventListener("click", showSaveButton);
	document.addEventListener("change", event => {
	  if (event.target.matches('input[data-field="file"]')) {
		const file = event.target.files[0];
		if (!file) return;

		openFileModal(event.target, file);
	  }
	});
	document.getElementById('modal-upload-save-btn').onclick = async () => {
		if (!selectedFileInput || !selectedFile) return;

		try {
			await uploadAttachment(selectedFileInput); // You already implemented this
			await saveLogsheet();                     // Your sheet save function
		} catch (err) {
			console.error("Error uploading or saving:", err);
			alert("Upload or save failed. Check console.");
		}

		closeFileModal();
	};

	document.getElementById('modal-cancel-btn').onclick = () => {
		if (selectedFileInput)
			selectedFileInput.value = ""; // reset file input

		closeFileModal();
	};


});




function newLogsheet() {
    document.getElementById('logsheet-title').value = '';
    document.getElementById('logsheet-author').value = '';
    document.getElementById('created-at').value = '';
    document.getElementById('modified-at').value = '';
    document.getElementById('items-container').innerHTML = '';
    document.getElementById('logsheet-id').value = '';
	document.getElementById('logsheet-rev').value = '';

}


/*
// Login function (Redirect to Auth0 login page)
async function login() {
    try {
        await auth0Client.loginWithPopup();  // ✅ No redirect, faster debugging
		const token = await auth0Client.getTokenSilently();  // ✅ Get token
        localStorage.setItem("auth_token", token);  // ✅ Store in localStorage
        const user = await auth0Client.getUser();
		https://fablogcloud.vercel.app/api/getAllLogsheetTitles
        console.log("Logged in user:", user);
    } catch (error) {
        console.error("Login failed:", error);
    }
}

*/
function goToLogin() {
  window.location.href = '/login.html';
}

function logout() {
  localStorage.removeItem("token");
  document.getElementById("user-info").innerHTML = "";
  window.location.href = "/login.html";
  
}

// Check if user is authenticated
async function checkUser() {
    const token = localStorage.getItem('token');
	if ((!token) || isTokenExpired(token)) logout() 
		else document.getElementById("user-info").innerHTML = `User: ${localStorage.getItem('userName')}`;
}

function isTokenExpired(token) {
  if (!token) return true;

  const payload = JSON.parse(atob(token.split(".")[1]));
  const expiry = payload.exp * 1000; // convert seconds → ms

  return Date.now() > expiry;
}

//window.onload = checkUser;

function autoResizeTextarea(element) {
    element.style.height = 'auto';
    element.style.height = element.scrollHeight + 'px';
}

function openLoadModal() {
    fetchLogsheetTitles();
	document.getElementById('loadModal').style.display = 'block';
}

function closeLoadModal() {
    document.getElementById('loadModal').style.display = 'none';
}

let selectedFileInput = null;
let selectedFile = null;

function openFileModal(inputElement, file) {
    selectedFileInput = inputElement;
    selectedFile = file;

    document.getElementById('modal-file-name').textContent =
        "Selected file: " + file.name;

    document.getElementById('file-upload-modal').style.display = "flex";
}

function closeFileModal() {
    document.getElementById('file-upload-modal').style.display = "none";
    selectedFileInput = null;
    selectedFile = null;
}


async function fetchLogsheetTitles() {
    try {
		const token = localStorage.getItem('token');
		const logsheetList = document.getElementById('logsheet-list');
        logsheetList.innerHTML = '<H4>Fetching logsheets...</H4>';
		const response = await fetch(`/sheets/titles`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
				"Authorization": 'Bearer ' + token
            }
        });
        const jsonData = await response.json();
        if (response.ok && jsonData.length > 0) {
            logsheetList.innerHTML = '';
			jsonData.forEach(title => {
                const li = document.createElement('li');
                li.className = "clickable";
				li.textContent = title;
                li.onclick = () => {
                    fetchLogsheet(title);
                    closeLoadModal();
                };
                logsheetList.appendChild(li);
            });
        } else {
            logsheetList.innerHTML = '<li>No logsheets found</li>';
			if (response.status === 401) {
				alert("Please log in");
				checkUser();
				return;
			}
        }
    } catch (error) {
        console.error("Failed to load logsheet titles:", error.message);
    }
}

function filterLogsheets() {
    const filter = document.getElementById('search-logsheets').value.toUpperCase();
    const logsheetList = document.getElementById('logsheet-list');
    const items = logsheetList.getElementsByTagName('li');

    for (let i = 0; i < items.length; i++) {
        const txtValue = items[i].textContent || items[i].innerText;
        items[i].style.display = txtValue.toUpperCase().indexOf(filter) > -1 ? "" : "none";
    }
}

async function fetchLogsheet(title) {
	
    try {
		const token = localStorage.getItem('token');
		const response = await fetch(`/sheets/${encodeURIComponent(title)}`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
				"Authorization": 'Bearer ' + token
            }
        });
        const jsonData = await response.json();
        if (response.ok) {
            renderLogsheet(jsonData);
        } else {
            console.error("Failed to load logsheet:", jsonData.error);
        }
    } catch (error) {
        console.error("Error selecting logsheet:", error.message);
    }
}

function addProcedure() {
    const itemsContainer = document.getElementById('items-container');
    const logsheetStep = document.createElement('div');
    logsheetStep.className = 'logsheet-step';

    const timestamp = new Date().toLocaleString();

    logsheetStep.innerHTML = `
            <div class="tag step-tag">Procedure</div>
			<input type="hidden" name="step-id" value="">
			<button class="remove-item" onclick="this.parentElement.remove()">X</button>
            
            <label>Title</label>
            <input class="logsheet-step-title" type="text" placeholder="Enter procedure title" style="text-align:center;" data-field="title" >
            
            <label>Description</label>
            <textarea rows="2" placeholder="Enter detailed procedure description" data-field="description"></textarea>
            
            <label>Procedures</label>
            <textarea rows="3" placeholder="Enter procedures" class="textbox-lines" data-field="procedures" ></textarea>

            <label>Author</label>
            <input type="text" placeholder="Enter author name" data-field="author">

            <label>Timestamp</label>
            <input type="text" data-field="timestamp" class="step-timestamp" placeholder="Timestamp" value="${timestamp}" readonly>
			<button onclick="loadFromTemplate(this)">Load from Template</button>
            <button class="save-template-btn" onclick="saveToTemplate(this)"><i class="fas fa-save"></i></button>
            
        `;
    itemsContainer.appendChild(logsheetStep);
    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.addEventListener('input', function () {
            autoResizeTextarea(this);
        });
    });
}

function addNote() {
    const itemsContainer = document.getElementById('items-container');
    const noteItem = document.createElement('div');
    noteItem.className = 'logsheet-step';
    const timestamp = new Date().toLocaleString();
    noteItem.innerHTML = `
            <div class="tag step-tag">Note</div>
			<button class="remove-item" onclick="this.parentElement.remove()">X</button>
            
            <label>Note Content</label>
            <textarea rows="3" placeholder="Enter note content" data-field="content"></textarea>
			<label>Timestamp</label>
            <input type="text" class="step-timestamp" data-field="timestamp"  placeholder="Timestamp" value="${timestamp}" readonly>
        `;
    itemsContainer.appendChild(noteItem);
}

function addAttachment() {
    const itemsContainer = document.getElementById('items-container');
    const attachmentItem = document.createElement('div');
    attachmentItem.className = 'logsheet-step';
    //const fileObjectId = ""; // Initially, no file is uploaded
    const timestamp = new Date().toLocaleString();
    attachmentItem.innerHTML = `
            <div class="tag step-tag">Attachment</div>
			<button class="remove-item" onclick="this.parentElement.remove()">X</button>
            
            <label>Attachment</label>
            <input type="file" onchange="updateFileName(this)" data-field="file">
            <span class="file-name">No file selected</span>

            <label>Description</label>
            <textarea rows="2" placeholder="Enter attachment description" data-field="description"></textarea>

            <!--button onclick="uploadAttachment(this)">Upload</button--!>
			<label>Timestamp</label>
            <input type="text" class="step-timestamp" data-field="timestamp"  placeholder="Timestamp" value="${timestamp}" readonly>
			<input type="hidden" name="attachment-id"  data-field="attachment-id" value=""> 
			<a class="download-link" style="display:none;">Download</a>
        `;
    itemsContainer.appendChild(attachmentItem);
}

function updateFileName(input) {
    const fileNameIndicator = input.nextElementSibling;
    const file = input.files[0];
    fileNameIndicator.textContent = file ? `File: ${file.name}` : "No file selected";
}

async function saveToTemplate(button) {
    // Find the parent element (the item where the button is located)
    const parentItem = button.parentElement;
    const title = parentItem.querySelector('[data-field="title"]')?.value || '';
    const description = parentItem.querySelector('[data-field="description"]')?.value || '';
    const procedures = parentItem.querySelector('[data-field="procedures"]')?.value || '';

    // Create the template object
    const template = {
        title: title,
        description: description,
        procedures: procedures,
        createdAt: new Date().toISOString()
    };

    // Call the backend to save the template
    try {
		const token = localStorage.getItem('token');
        const response = await fetch("/templates", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
				'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(template)
        });
        const jsonData = await response.json();
        if (jsonData.ok) {
            alert("Template saved successfully!");
        } else {
            console.error("Failed to save template:", jsonData.error);
            alert("Failed to save template: " + jsonData.error);
        }
    } catch (error) {
        console.error("Error saving template:", error.message);
        alert("Error saving template: " + error.message);
    }
}

async function readSmallFile(file, fileName) {
    // Convert the file to base64 (this will also handle binary data)
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onloadend = async function () {
            const base64Data = reader.result.split(",")[1]; // Strip the base64 metadata
            resolve({
                base64Data,
                fileName
            });
        };

        reader.onerror = reject;
        reader.readAsDataURL(file); // Read the file as base64 data URL
    });
}

async function uploadAttachment(inputEl) {
    const attachmentItem = inputEl.parentElement;
    //const fileInput = attachmentItem.querySelector('input[type="file"]');
    const file = inputEl.files[0];
	const formData = new FormData();
	formData.append("file", file);

    if (!file) {
        alert("Please select a file before uploading.");
        return;
    }
   /*  const {
        base64Data,
        fileName
    } = await readSmallFile(file, file.name); */
    const fileNameIndicator = attachmentItem.querySelector('.file-name');
    try {
		const token = localStorage.getItem('token');
        const response = await fetch("/sheets/upload", {
            method: "POST",
            headers: {
				'Authorization': 'Bearer ' + token
            },
			body: formData,

        });
        const jsonData = await response.json();
        if (jsonData.success) {
            fileNameIndicator.textContent = `File: ${file.name} (Uploaded)`;
            attachmentItem.querySelector('input[name=attachment-id]').value = jsonData.attachmentId;
        } else {
            console.error("Uploading attachment failed:", jsonData.error);
            fileNameIndicator.textContent = "Upload failed";
        }
    } catch (error) {
        console.error("Error uploading file:", error.message);
        alert("Error uploading file: " + error.message);
    }

}
///////////////////////////////////
/// NOT USED
///////////////////////////////////
async function downloadAttachment(fileId) {
    try {
        // Call the MongoDB App Services function to get the file data
        // DELETE const response = await app.currentUser.functions.download(fileId);
        const response = await fetch(`/api/download?fileId=${encodeURIComponent(fileId)}`, {
            method: "GET",
            headers: {
                "Accept": "application/octet-stream"
            }
        });
        const jsonData = await response.json();
        if (jsonData.success) {
            // Create a downloadable link using the base64 data
            const a = document.createElement("a");
            const base64Data = jsonData.fileData;
            const contentType = jsonData.contentType || "application/octet-stream";
            const fileName = jsonData.fileName;

            // Construct the href for the download link
            a.href = `data:${contentType};base64,${base64Data}`;
            a.download = fileName;

            // Trigger the download by programmatically clicking the link
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            alert("Failed to download file: " + jsonData.error);
        }
    } catch (error) {
        console.error("Error downloading file:", error.message);
        alert("Error downloading file: " + error.message);
    }
}

async function saveLogsheet() {
    
    const logsheet = {
        _id: document.getElementById('logsheet-id').value,
        rev: document.getElementById('logsheet-rev').value,
        title: document.getElementById('logsheet-title').value,
        author: document.getElementById('logsheet-author').value,
        created_at: document.getElementById('created-at').value || new Date().toLocaleString(),
        last_modified_at: new Date().toLocaleString(),
        items: []
    };


    document.querySelectorAll('.logsheet-step').forEach(step => {
        const type = step.querySelector('.tag').textContent.toLowerCase();

        if (type === 'procedure') {
            logsheet.items.push({
                type,
                title: step.querySelector('[data-field="title"]').value,
                description: step.querySelector('[data-field="description"]').value,
                procedures: step.querySelector('[data-field="procedures"]').value,
				author: step.querySelector('[data-field="author"]').value,
                timestamp: step.querySelector('[data-field="timestamp"]').value
            });
        }

        else if (type === 'note') {
            logsheet.items.push({
                type,
                content: step.querySelector('[data-field="content"]').value,
                timestamp: step.querySelector('[data-field="timestamp"]').value
            });
        }

        else if (type === 'attachment') {
            logsheet.items.push({
                type,
                filename: step.querySelector('[data-field="file"]').files[0]?.name ?? step.querySelector('.file-name').textContent,
                description: step.querySelector('[data-field="description"]').value,
                attachmentId: step.querySelector('[data-field="attachment-id"]').value,
                timestamp: step.querySelector('[data-field="timestamp"]').value
            });
        }
    });

	try {
		const token = localStorage.getItem('token');
		const response = await fetch('/sheets', {
		method: document.getElementById('logsheet-rev').value ? "PUT" : "POST",
		headers: {
		  'Content-Type': 'application/json',
		  'Authorization': 'Bearer ' + token
		},
		body: JSON.stringify(logsheet)
	  });
		const jsonData = await response.json();
		if (jsonData.ok) {
			document.getElementById('logsheet-id').value = jsonData.id.toString();
			document.getElementById('logsheet-rev').value = jsonData.rev.toString();
			alert("Logsheet saved!");
			document.getElementById("floating-save-button").style.display = "none";
		} else {
			console.error("Saving logsheet failed:", jsonData.error);
			alert("Saving failed: " + jsonData.error);
		}}
	catch (err) {
		// Catch ANY network error or thrown error above
		console.error("Request failed:", err.message);
		alert(`Failed to save sheet: ${err.message}`);
  }
}

async function deleteLogsheet() {
    
	const title = document.getElementById('logsheet-title').value;
	if (!confirm(`Are you sure you want to delete Logsheet "${title}"?`))
        return;
	
	try {
		const token = localStorage.getItem('token');
		const response = await fetch(`/sheets/${encodeURIComponent(title)}`, {
            method: "DELETE",
            headers: {
                "Accept": "application/json",
				"Authorization": 'Bearer ' + token
            }
        });
        const jsonData = await response.json();
        if (response.ok) {
            alert("Logsheet deleted!");
			newLogsheet();
        } else {
			alert("Delete failed!");
            console.error("Failed to delete logsheet:", jsonData.error);
        }
    } catch (error) {
		alert("Delete failed!");
        console.error("Error selecting logsheet:", error.message);
    }
	
}

async function renderLogsheet(logsheet) {
    try {

        document.getElementById('logsheet-title').value = logsheet.title || '';
        document.getElementById('logsheet-author').value = logsheet.author || '';
        document.getElementById('created-at').value = logsheet.createdAt || '';
        document.getElementById('modified-at').value = logsheet.lastModifiedAt || '';
        document.getElementById('logsheet-id').value = logsheet._id;
		document.getElementById('logsheet-rev').value = logsheet._rev;

        document.getElementById('items-container').innerHTML = '';
        document.getElementById("floating-save-button").style.display = "none";
        logsheet.items.forEach(item => {
  
			if (item.type === 'procedure') {
                addProcedure();
                 const step = document.getElementById('items-container').lastElementChild;

                step.querySelector('[data-field="title"]').value = item.title || '';
                step.querySelector('[data-field="description"]').value = item.description || '';
                step.querySelector('[data-field="procedures"]').value = item.procedures || '';
                step.querySelector('[data-field="author"]').value = item.procedures || '';
                step.querySelector('[data-field="timestamp"]').value = item.timestamp || '';
                autoResizeTextarea(step.querySelector('[data-field="procedures"]'));

            } else if (item.type === 'note') {
                addNote();
                const step = document.getElementById('items-container').lastElementChild;
                step.querySelector('[data-field="content"]').value = item.content || '';
                step.querySelector('[data-field="timestamp"]').value = item.timestamp || '';

            } else if (item.type === 'attachment') {
                addAttachment();
                const step = document.getElementById('items-container').lastElementChild;
                step.querySelector('.file-name').textContent = item.filename || 'No file selected';
                step.querySelector('[data-field="description"]').value = item.description || '';
                step.querySelector('[data-field="timestamp"]').value = item.timestamp || '';
                step.querySelector('[data-field="attachment-id"]').value = item.attachmentId || '';

                // Show download link if there is an ObjectId
                const downloadLink = step.querySelector('.download-link');
                if (item.attachmentId) {
                    downloadLink.style.display = 'inline';
                    downloadLink.href = `/downloads/${item.attachmentId}/${item.filename}`; 
                    downloadLink.textContent = 'Download';
                    //downloadLink.onclick = () => downloadAttachment(item.fileObjectId);
                    step.querySelector('[data-field="file"]').style.display = 'none';
                    //step.querySelector('button[onclick="uploadAttachment(this)"]').style.display = 'none';
                }
            }
        });
    } catch (error) {
        console.error("Failed to load logsheet for editing:", error.message);
        alert("Failed to load logsheet for editing: " + error.message);
    }
}


async function loadFromTemplate(button) {
    // Store the button's parent element to populate later when the user selects a template
    window.templateTargetItem = button.parentElement;

    // Open the modal and load the templates
    openTemplateModal();
}

function openTemplateModal() {
    document.getElementById('templateModal').style.display = 'block';

    // Load the list of templates
    fetchTemplateTitles();
}

function closeTemplateModal() {
    document.getElementById('templateModal').style.display = 'none';
}

async function fetchTemplateTitles() {
    try {
		const token = localStorage.getItem('token');
		const response = await fetch(`/templates/titles`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
				"Authorization": 'Bearer ' + token
            }
        });
        const templateList = document.getElementById('template-list');
        templateList.innerHTML = ''; // Clear any existing templates
        const jsonData = await response.json();
        if (jsonData.length > 0) {
            // Populate the template list with the fetched titles
            jsonData.forEach(title => {
                const li = document.createElement('li');
                li.innerHTML = `
                <span onclick="fetchTemplate('${title}')">${title}</span> 
                <button class="delete-template" onclick="deleteTemplate('${title}')">
                    <i class="fas fa-trash-alt"></i>
                </button>
				`;
                li.className = "template-item clickable";
                templateList.appendChild(li);
            });
        } else {
            templateList.innerHTML = '<li>No templates found</li>';
        }
    } catch (error) {
        console.error("Failed to load template titles:", error.message);
    }
}

function filterTemplates() {
    const filter = document.getElementById('search-templates').value.toUpperCase();
    const templateList = document.getElementById('template-list');
    const items = templateList.getElementsByTagName('li');

    for (let i = 0; i < items.length; i++) {
        const txtValue = items[i].textContent || items[i].innerText;
        items[i].style.display = txtValue.toUpperCase().indexOf(filter) > -1 ? "" : "none";
    }
}

async function fetchTemplate(title) {
    const token = localStorage.getItem('token');
	try {
		const response = await fetch(`/templates/${encodeURIComponent(title)}`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
				"Authorization": 'Bearer ' + token
            }
        });
        
        if (response.ok) {
            const template = await response.json();

            // Populate the form fields in the target logsheet step
            const parentItem = window.templateTargetItem;
            parentItem.querySelector('[data-field="title"]').value = template.title || '';
            parentItem.querySelector('[data-field="description"]').value = template.description || '';
            parentItem.querySelector('[data-field="procedures"]').value = template.procedures || '';
            autoResizeTextarea(parentItem.querySelector('[data-field="procedures"]'));

            alert("Template loaded successfully!");
            closeTemplateModal();
        } else {
            alert("Template not found or an error occurred: " + response.error);
        }
    } catch (error) {
        console.error("Error loading template:", error.message);
        alert("Failed to load template: " + error.message);
    }
}

async function deleteTemplate(title) {
    if (!confirm(`Are you sure you want to delete template "${title}"?`))
        return;

    try {
		const token = localStorage.getItem('token');
		const response = await fetch(`/templates/${encodeURIComponent(title)}`, {
            method: "DELETE",
            headers: {
                "Accept": "application/json",
				"Authorization": 'Bearer ' + token
            }
        });
        const jsonData = await response.json();
        if (response.ok) {
            alert("Template deleted!");
			newLogsheet();
        } else {
			alert("Delete failed!");
            console.error("Failed to delete logsheet:", jsonData.error);
        }
    } catch (error) {
		alert("Delete failed!");
        console.error("Error selecting logsheet:", error.message);
    }
}

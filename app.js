import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";
import { getDatabase, ref as dbRef, set } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAU6SZeD1YVAj297mh1s-m23zTt6ht621k",
  authDomain: "nio-library.firebaseapp.com",
  projectId: "nio-library",
  storageBucket: "nio-library.appspot.com",
  messagingSenderId: "23063683510",
  appId: "1:23063683510:web:ffb91b810fd4fccac1e117",
  measurementId: "G-Q05XZVVW2K",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const database = getDatabase(app);

// Upload form handling
const uploadForm = document.getElementById("uploadForm");
const fileInput = document.getElementById("fileInput");
const statusDiv = document.getElementById("status");

uploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  
  const file = fileInput.files[0];
  if (!file) return;

  statusDiv.textContent = "Uploading to Firebase...";

  // Upload file to Firebase Storage
  const storageRef = ref(storage, `uploads/${file.name}`);
  await uploadBytes(storageRef, file);
  const fileURL = await getDownloadURL(storageRef);
  statusDiv.textContent = "File uploaded to Firebase. Saving to GitHub...";

  // Save to GitHub
  const githubURL = "https://api.github.com/repos/SHAHANIO/library/contents/uploads/" + file.name;
  const githubToken = "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";
  const content = await file.text(); // Convert file to text for GitHub API
  const encodedContent = btoa(unescape(encodeURIComponent(content))); // Base64 encode content

  // Upload file to GitHub
  fetch(githubURL, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${githubToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `Add ${file.name}`,
      content: encodedContent,
    }),
  })
    .then((response) => {
      if (response.ok) {
        statusDiv.textContent = "File successfully uploaded to GitHub! Saving link to Firebase...";
        
        // Save the GitHub URL to Firebase
        const linkRef = dbRef(database, 'fileLinks/' + file.name);
        set(linkRef, {
          url: fileURL, // URL from Firebase storage
          github_url: `https://github.com/SHAHANIO/library/blob/main/uploads/${file.name}`, // GitHub URL
        }).then(() => {
          statusDiv.textContent = "Link successfully saved to Firebase!";
        }).catch((error) => {
          statusDiv.textContent = `Error saving link to Firebase: ${error.message}`;
        });
      } else {
        statusDiv.textContent = "Failed to upload to GitHub.";
      }
    })
    .catch((error) => {
      statusDiv.textContent = `Error: ${error.message}`;
    });
});

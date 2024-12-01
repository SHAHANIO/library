import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

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
const db = getFirestore(app);

// GitHub configuration
const githubRepo = "https://api.github.com/repos/SHAHANIO/library/contents/";
const githubToken = "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"; // Replace with your GitHub token

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

  statusDiv.textContent = "File uploaded to Firebase. Saving details to Firestore...";

  // Define the book details
  const bookDetails = {
    author: document.getElementById("author").value,
    bookNo: parseInt(document.getElementById("bookNo").value),
    coverSrc: document.getElementById("coverSrc").value,
    fileLink: fileURL, // Firebase file link
    language: document.getElementById("language").value,
    subTitle: document.getElementById("subTitle").value,
    title: document.getElementById("title").value,
  };

  try {
    // Save the book details in Firestore
    const docRef = await addDoc(collection(db, "Books"), bookDetails);
    statusDiv.textContent = "Book details successfully saved to Firestore!";

    // Upload file to GitHub
    const base64File = await convertFileToBase64(file);
    await uploadFileToGitHub(file.name, base64File);
    statusDiv.textContent += " The file has been uploaded to GitHub.";

  } catch (error) {
    statusDiv.textContent = `Error: ${error.message}`;
  }
});

// Function to convert file to Base64 (needed for GitHub upload)
function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Function to upload file to GitHub repository
async function uploadFileToGitHub(fileName, base64File) {
  const content = {
    message: `Upload ${fileName}`,
    content: base64File,
  };

  const response = await fetch(githubRepo + "Files/Books/" + fileName, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${githubToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(content),
  });

  if (!response.ok) {
    throw new Error("GitHub upload failed: " + response.statusText);
  }

  const data = await response.json();
  return data;
}

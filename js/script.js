const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

// Deklarasi 2 elemen untuk checkbox
const checkBox = document.getElementById("inputBookIsComplete");
const submitButtonText = document.getElementById("checkbox_status");

// Fungsi untuk cek ketersediaan storage di browser
function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

// Fungsi untuk generate id pada buku
function generateId() {
  return +new Date();
}

// Fungsi untuk membuat sebuah object buku yang akan dimasukkan
function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

// Fungsi untuk mencari book berdasarkan id
function findBookbyID(bookID) {
  for (const bookItem of books) {
    if (bookItem.id === bookID) {
      return bookItem;
    }
  }
  return null;
}

// Fungsi untuk mencari index dari suatu object book
function findBookIndex(bookID) {
  for (const index in books) {
    if (books[index].id === bookID) {
      return index;
    }
  }
  return -1;
}

// Fungsi untuk membuat item book
function makeBook(bookObject) {
  const bookTitle = document.createElement("h3");
  bookTitle.innerText = bookObject.title;

  const bookAuthor = document.createElement("p");
  bookAuthor.innerText = "Penulis: " + bookObject.author;

  const bookYear = document.createElement("p");
  bookYear.innerText = "Tahun: " + bookObject.year;

  const actionButton = document.createElement("div");
  actionButton.classList.add("action");

  const bookArticle = document.createElement("article");
  bookArticle.classList.add("book_item");
  bookArticle.append(bookTitle, bookAuthor, bookYear, actionButton);
  bookArticle.setAttribute("id", `book-${bookObject.id}`);

  if (bookObject.isComplete) {
    const unCompleteButton = document.createElement("button");
    unCompleteButton.classList.add("green");
    unCompleteButton.innerText = "Belum selesai";

    unCompleteButton.addEventListener("click", function () {
      addBookToUncompleted(bookObject.id);
    });

    actionButton.append(unCompleteButton);
  } else {
    const completeButton = document.createElement("button");
    completeButton.classList.add("green");
    completeButton.innerText = "Selesai";

    completeButton.addEventListener("click", function () {
      addBookToCompleted(bookObject.id);
    });

    actionButton.append(completeButton);
  }

  const editButton = document.createElement("button");
  editButton.classList.add("blue");
  editButton.innerText = "Ubah";

  editButton.addEventListener("click", function () {
    showEditPopup(bookObject.id);
  });

  const trashButton = document.createElement("button");
  trashButton.classList.add("red");
  trashButton.innerText = "Hapus";

  trashButton.addEventListener("click", function () {
    showDeletePopup(bookObject.id);
  });

  actionButton.append(editButton, trashButton);

  return bookArticle;
}

// Fungsi untuk menyimpan data ke localStorage
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

// Fungsi untuk mengambil data dari localStorage
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

// Fungsi untuk menambahkan buku baru
function addBook() {
  const inputBookTitle = document.getElementById("inputBookTitle").value;
  const inputBookAuthor = document.getElementById("inputBookAuthor").value;
  const inputBookYear = parseInt(
    document.getElementById("inputBookYear").value
  );
  const inputBookIsComplete = document.getElementById("inputBookIsComplete");

  function isCompleteCheckBox() {
    return inputBookIsComplete.checked;
  }

  const generateID = generateId();
  const bookObject = generateBookObject(
    generateID,
    inputBookTitle,
    inputBookAuthor,
    inputBookYear,
    isCompleteCheckBox()
  );

  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// Fungsi untuk mengubah buku belum dibaca menjadi sudah
function addBookToCompleted(bookId) {
  const bookTarget = findBookbyID(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// Fungsi untuk menhapus buku
function removeBookFromList(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// Fungsi untuk memindahkan buku yang selesai ke belum
function addBookToUncompleted(bookId) {
  const bookTarget = findBookbyID(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// Fungsi untuk mencari buku berdasarkan judul
function searchBookbyTittle() {
  const searchButton = document.getElementById("searchSubmit");
  const searchBookTitle = document.getElementById("searchBookTitle");

  searchButton.addEventListener("click", function (event) {
    event.preventDefault(); // Mencegah tombol dari aksi default yaitu reload halaman
    const searchInput = searchBookTitle.value.toLowerCase();

    const filteredBooks = books.filter((book) =>
      book.title.toLowerCase().includes(searchInput)
    );

    const incompleteBookshelfList = document.getElementById(
      "incompleteBookshelfList"
    );
    const completeBookshelfList = document.getElementById(
      "completeBookshelfList"
    );

    // Kosongkan elemen daftar sebelum menambahkan elemen buku baru
    incompleteBookshelfList.innerHTML = "";
    completeBookshelfList.innerHTML = "";

    for (const bookItem of filteredBooks) {
      const bookElement = makeBook(bookItem);
      if (!bookItem.isComplete) {
        incompleteBookshelfList.append(bookElement);
      } else {
        completeBookshelfList.append(bookElement);
      }
    }

    if (filteredBooks.length === 0) {
      alert("Judul tidak ditemukan");
    }
  });
}

// Fungsi untuk menampilkan popup hapus
let bookIdToDelete = null;

function showDeletePopup(bookId) {
  bookIdToDelete = bookId;
  document.getElementById("deletePopup").style.display = "block";
}

function hideDeletePopup() {
  document.getElementById("deletePopup").style.display = "none";
}

document.getElementById("cancelDelete").addEventListener("click", function () {
  hideDeletePopup();
});

document.getElementById("confirmDelete").addEventListener("click", function () {
  if (bookIdToDelete !== null) {
    removeBookFromList(bookIdToDelete);
    hideDeletePopup();
  }
});

// Fungsi untuk menampilkan popup edit
let bookIdToEdit = null;

function showEditPopup(bookId) {
  const book = findBookbyID(bookId);
  if (book) {
    document.getElementById("editBookTitle").value = book.title;
    document.getElementById("editBookAuthor").value = book.author;
    document.getElementById("editBookYear").value = book.year;
    document.getElementById("editBookIsComplete").checked = book.isComplete;

    bookIdToEdit = bookId;
    document.getElementById("editPopup").style.display = "block";
  }
}

function hideEditPopup() {
  document.getElementById("editPopup").style.display = "none";
}

document.getElementById("cancelEdit").addEventListener("click", function () {
  hideEditPopup();
});

document
  .getElementById("editBookForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const editedTitle = document.getElementById("editBookTitle").value;
    const editedAuthor = document.getElementById("editBookAuthor").value;
    const editedYear = parseInt(document.getElementById("editBookYear").value);
    const editedIsComplete =
      document.getElementById("editBookIsComplete").checked;

    const book = findBookbyID(bookIdToEdit);
    if (book) {
      book.title = editedTitle;
      book.author = editedAuthor;
      book.year = editedYear;
      book.isComplete = editedIsComplete;

      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData();
      hideEditPopup();
    }
  });

// Event yang akan dijalankan setelah dokumen HTML dan CSS selesai ditampilkan
document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function (event) {
    addBook();
    event.preventDefault();
  });

  // Fungsi untuk mengubah tulisan di submit button sesuai kondisi checkbox
  checkBox.addEventListener("click", function () {
    if (checkBox.checked) {
      submitButtonText.innerText = "Selesai dibaca";
    } else {
      submitButtonText.innerText = "Belum selesai dibaca";
    }
  });

  searchBookbyTittle();

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

// Custom event yang kita buat untuk merender tampilan
document.addEventListener(RENDER_EVENT, function () {
  const incompleteBookshelfList = document.getElementById(
    "incompleteBookshelfList"
  );
  const completeBookshelfList = document.getElementById(
    "completeBookshelfList"
  );

  // Kosongkan elemen daftar sebelum menambahkan elemen buku baru
  incompleteBookshelfList.innerHTML = "";
  completeBookshelfList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isComplete) {
      incompleteBookshelfList.append(bookElement);
    } else {
      completeBookshelfList.append(bookElement);
    }
  }
});

// Custom event untuk save data
document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

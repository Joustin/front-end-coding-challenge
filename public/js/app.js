const defaultBookState = {
  id: "",
  description: "",
  pages: "",
  release_date: "",
  authors: "",
  issue_number: "",
  title: "No Book Selected",
  age_rating: "",
  series_title: "",
  image: "http://via.placeholder.com/235x360",
};

const makeBookObj = (data) => {
  const book = data[0];
  const authors = book.authors.join(", ");
  return {
    id: book.id,
    description: book.description,
    pages: book.pages.toString(),
    release_date: book.release_date,
    authors,
    issue_number: book.issue_number,
    title: book.title,
    age_rating: book.age_rating,
    series_title: book.series_title,
    image: book.image,
  };
};

const activeButtons = (classes) => {
  const buttons = document.querySelectorAll(classes);

  for (let i = 0; i < buttons.length; i++) {
    buttons[i].onclick = function () {
      let activeButton = document.querySelector(`${classes}.active`);
      if (activeButton) {
        activeButton.classList.remove("active");
      }
      this.classList.add("active");
    };
  }
};

export default class TagBrowserWidget {
  constructor(config) {
    this.config = config;

    this.state = {
      book: { ...defaultBookState },
    };

    fetch("/js/data.json")
      .then((response) => response.json())
      // use .bind because native promises change the "this" context
      .then(this.setData.bind(this))
      .then(this.getElements.bind(this))
      .then(this.bindEventListeners.bind(this))
      .then(this.renderTagList.bind(this))
      .then(this.renderBook.bind(this));
  }

  setData(data) {
    this.data = data;
    return this.data;
  }

  getElements() {
    this.tagList = this.config.element.querySelectorAll(".tag-list")[0];
    this.matchingItemsList = this.config.element.querySelectorAll(
      ".matching-items-list"
    )[0];
    this.selectedItem =
      this.config.element.querySelectorAll(".selected-item")[0];
    this.clearButton = this.config.element.querySelectorAll(".clear-button")[0];
    this.selectedTagTitle = this.config.element.querySelectorAll(
      ".column.content > h3.subtitle"
    )[0];
    this.selectedBookTitle = this.config.element.querySelectorAll(
      ".selected-item > .content > h3.subtitle"
    )[0];
  }

  bindEventListeners() {
    this.tagList.addEventListener("click", this.tagListClicked.bind(this));
    this.matchingItemsList.addEventListener(
      "click",
      this.matchingItemsListClicked.bind(this)
    );
    this.clearButton.addEventListener(
      "click",
      this.clearButtonClicked.bind(this)
    );
  }

  tagListClicked(event) {
    console.log("tag list (or child) clicked", event);

    const tagText = event.target.innerText;
    // event.target.classList.toggle("active");

    const bookTitlesMarkup = this.data
      .filter((book) => {
        return book.tags.includes(tagText);
      })
      .map((book) => {
        return `<li><button type="button" class="bookTitle" data-uid="${book.id}">${book.title}</button></li>`;
      })
      .join("");

    this.selectedTagTitle.replaceChildren(tagText);
    this.matchingItemsList.replaceChildren("");
    this.matchingItemsList.insertAdjacentHTML("afterbegin", bookTitlesMarkup);

    activeButtons(".bookTitle");
  }

  matchingItemsListClicked(event) {
    console.log("tag list (or child) clicked - LIST", event);
    const listItemId = event.target.dataset.uid;

    const selectedBook = this.data.filter((book) => {
      return book.id === listItemId;
    });

    if (event.target.localName === "button") {
      this.state.book = makeBookObj(selectedBook);
      this.renderBook();
      // console.log("this.state.book : ", this.state.book);
    }
  }

  clearButtonClicked(event) {
    console.log("tag list (or child) clicked - CLEAR", event);
    this.selectedTagTitle.replaceChildren("No Tag Selected");
    this.matchingItemsList.replaceChildren("");
    this.state.book = defaultBookState;
    this.renderBook();
    this.tagList.replaceChildren("");
    this.renderTagList();
  }

  renderTagList() {
    const tags = this.data.map((book) => book.tags);
    const tagsFlat = [].concat(...tags);
    const uniqueTags = [...new Set(tagsFlat)];

    const tagMarkUp = uniqueTags
      .sort()
      .map((tag) => {
        return `
      <li><button class="tag is-link">${tag}</button></li>
      `;
      })
      .join("");

    this.tagList.insertAdjacentHTML("afterbegin", tagMarkUp);

    activeButtons(".tag.is-link");
  }

  renderBook() {
    const bookDisplay = `
      <div class="content">
      <h3 class="subtitle">${this.state.book.title}</h3>
      <img src="${this.state.book.image}" />
      <p>${this.state.book.description}</p>
    </div>
    <ul>
      <li><strong>Pages:</strong><span>${this.state.book.pages}</span></li>
      <li><strong>Release Date:</strong> <span>${this.state.book.release_date}</span></li>
      <li>
        <strong>Authors:</strong>
        <span>${this.state.book.authors}</span>
      </li>
      <li><strong>Issue Number:</strong> <span>${this.state.book.issue_number}</span></li>
      <li><strong>Age Range:</strong> <span>${this.state.book.age_rating}</span></li>
      <li>
        <strong>Series Title:</strong>
        <span>${this.state.book.series_title}</span>
      </li>
    </ul>
    `;
    this.selectedItem.replaceChildren("");
    this.selectedItem.insertAdjacentHTML("afterbegin", bookDisplay);
  }
}

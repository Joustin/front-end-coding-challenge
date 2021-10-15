export default class TagBrowserWidget {
  constructor(config) {
    this.config = config;

    fetch("/js/data.json")
      .then((response) => response.json())
      // use .bind because native promises change the "this" context
      .then(this.setData.bind(this))
      .then(this.getElements.bind(this))
      .then(this.bindEventListeners.bind(this))
      .then(this.renderTagList.bind(this));

    console.log("Widget Instance Created");
  }

  setData(data) {
    this.data = data;
    console.log("Data fetched", this.data);
    return this.data;
  }

  getElements() {
    // find and store other elements you need
    this.tagList = this.config.element.querySelectorAll(".tag-list")[0];
    this.matchingItemsList = this.config.element.querySelectorAll(
      ".matching-items-list"
    )[0];
    this.selectedItem =
      this.config.element.querySelectorAll(".selected-item")[0];
    this.clearButton = this.config.element.querySelectorAll(".clear-button")[0];
    // this.selectedTagTitle = this.config.element.querySelectorAll(
    //   "#selected-tag-title"
    // )[0];
    this.selectedTagTitle = this.config.element.querySelectorAll(
      ".column.content > h3.subtitle"
    )[0];
    this.selectedBookTitle = this.config.element.querySelectorAll(
      ".selected-item > .content > h3.subtitle"
    )[0];

    console.log("this.tagList", this.tagList);
    console.log("this.matchingItemsList", this.matchingItemsList);
    console.log("this.selectedItem", this.selectedItem);
    console.log("this.clearButton", this.clearButton);
    console.log("this.selectedTagTitle", this.selectedTagTitle);
    console.log("this.selectedBookTitle", this.selectedBookTitle);
  }

  bindEventListeners() {
    this.tagList.addEventListener("click", this.tagListClicked.bind(this));
    // bind the additional event listener for clicking on a series title
    this.matchingItemsList.addEventListener(
      "click",
      this.matchingItemsListClicked.bind(this)
    );
  }

  renderTagList() {
    // render the list of tags from this.data into this.tagList

    const tags = this.data.map((book) => book.tags);
    const tagsFlat = [].concat(...tags);
    const uniqueTags = [...new Set(tagsFlat)];

    console.log("uniqueTags::::", uniqueTags);

    const tagMarkUp = uniqueTags
      .map((tag) => {
        return `
      <li><button class="tag is-link">${tag}</button></li>
      `;
      })
      // SORT NOT WORKING
      .sort((a, b) => a - b)
      .join("");

    this.tagList.insertAdjacentHTML("afterbegin", tagMarkUp);
  }

  tagListClicked(event) {
    console.log("tag list (or child) clicked", event);
    const tagText = event.target.innerText;
    console.log("ttagText: ", tagText);
    // check to see if it was a tag that was clicked and render
    // the list of series that have the matching tags

    const bookTitles = this.data
      .filter((book) => {
        return book.tags.includes(tagText);
      })
      // SORT NOT WORKING
      .sort((a, b) => a - b)
      .map((book) => book.title);

    const titlesMarkUp = bookTitles
      .map((title) => {
        return `
      <li>${title}</li>
      `;
      })
      .join("");

    this.selectedTagTitle.replaceChildren(tagText);
    this.matchingItemsList.replaceChildren("");
    this.matchingItemsList.insertAdjacentHTML("afterbegin", titlesMarkUp);
  }

  matchingItemsListClicked(event) {
    console.log("tag list (or child) clicked", event);

    // check to see if it was a tag that was clicked and render
    // the list of series that have the matching tags
  }
}

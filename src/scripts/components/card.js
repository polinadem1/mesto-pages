export const createCardElement = (cardData, { onPreviewPicture, onLikeClick, onDeleteClick, onInfoClick, currentUserId }) => {
  const template = document.querySelector("#card-template");
  const cardElement = template.content.cloneNode(true).querySelector(".card");

  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCounter = cardElement.querySelector(".card__like-count");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const infoButton = cardElement.querySelector(".card__control-button_type_info");

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;
  likeCounter.textContent = cardData.likes?.length || 0;

  if (cardData.likes?.some((like) => like._id === currentUserId)) {
    likeButton.classList.add("card__like-button_active");
  }

  likeButton.addEventListener("click", () => onLikeClick(cardData._id, cardElement));
  cardImage.addEventListener("click", () => onPreviewPicture(cardData));

  if (currentUserId === cardData.owner?._id) {
    deleteButton.addEventListener("click", () => onDeleteClick(cardData._id, cardElement));
  } else {
    deleteButton.remove();
  }

  if (infoButton) {
    infoButton.addEventListener("click", () => onInfoClick(cardData._id));
  }

  return cardElement;
};

export const updateCardLike = (cardElement, likesArray) => {
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCounter = cardElement.querySelector(".card__like-count");
  likeButton.classList.toggle("card__like-button_active");
  likeCounter.textContent = likesArray.length;
};

export const removeCardElement = (cardElement) => {
  cardElement.remove();
};
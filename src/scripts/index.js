import { createCardElement } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setUserAvatar,
  addCard,     
  deleteCard,
  changeLikeCardStatus,
} from "./components/api.js";
import { enableValidation } from "./components/validation.js";
const placesWrap = document.querySelector(".places__list");
const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow?.querySelector(".popup__form");
const profileTitleInput = profileForm?.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm?.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow?.querySelector(".popup__form");
const cardNameInput = cardForm?.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm?.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow?.querySelector(".popup__image");
const imageCaption = imageModalWindow?.querySelector(".popup__caption");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow?.querySelector(".popup__form");
const avatarInput = avatarForm?.querySelector(".popup__input");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

let currentUserId = null;


const removeCardModalWindow = document.querySelector(".popup_type_remove-card");
const removeCardForm = removeCardModalWindow?.querySelector(".popup__form");

let cardToDelete = null;
let cardIdToDelete = null;

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const createInfoString = (term, description) => {
  const template = document.querySelector("#popup-info-definition-template");
  const element = template.content.cloneNode(true);
  element.querySelector(".popup__info-term").textContent = term;
  element.querySelector(".popup__info-description").textContent = description;
  return element;
};

const createUserItem = (userName) => {
  const template = document.querySelector("#popup-info-user-preview-template");
  const element = template.content.cloneNode(true);
  element.querySelector(".popup__list-item").textContent = userName;
  return element;
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleLikeClick = (cardId, likeButton, likeCounter) => {
  const isLiked = likeButton.classList.contains("card__like-button_active");
  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      likeButton.classList.toggle("card__like-button_active");
      likeCounter.textContent = updatedCard.likes.length;
    })
    .catch((err) => console.error("Ошибка лайка:", err));
};


let deleteButtonElement = null;


const handleDeleteClick = (cardId, cardElement) => {
  console.log("handleDeleteClick вызвана");
  
  cardIdToDelete = cardId;
  cardToDelete = cardElement;
  openModalWindow(removeCardModalWindow);
};

const handleConfirmDelete = (evt) => {
  evt.preventDefault();
  
  const submitButton = evt.submitter;
  const originalText = submitButton.textContent;
  
  submitButton.textContent = "Удаление...";
  
  deleteCard(cardIdToDelete)
    .then(() => {
      if (cardToDelete) {
        cardToDelete.remove();
      }
      closeModalWindow(removeCardModalWindow);
      cardIdToDelete = null;
      cardToDelete = null;
    })
    .catch((err) => {
      console.error("Ошибка при удалении карточки:", err);
    })
    .finally(() => {
      submitButton.textContent = originalText;
    });
};

if (removeCardForm) {
  removeCardForm.addEventListener("submit", handleConfirmDelete);
}

if (removeCardForm) {
  removeCardForm.addEventListener("submit", handleConfirmDelete);
}



const handleInfoClick = (cardId) => {
  const popup = document.querySelector(".popup_type_info");
  const popupTitle = popup.querySelector(".popup__title");
  const popupInfo = popup.querySelector(".popup__info");
  const popupList = popup.querySelector(".popup__list");
  const popupText = popup.querySelector(".popup__text");
  
  popupInfo.innerHTML = "";
  popupList.innerHTML = "";
  
  popupTitle.textContent = "Загрузка...";
  openModalWindow(popup);
  
  getCardList()
    .then((cards) => {
      const cardData = cards.find(card => card._id === cardId);
      
      if (!cardData) {
        throw new Error("Карточка не найдена");
      }
      
      popupTitle.textContent = "Информация о карточке";
      
      popupInfo.append(createInfoString("Описание:", cardData.name));
      
      if (cardData.createdAt) {
        popupInfo.append(createInfoString("Дата создания:", formatDate(cardData.createdAt)));
      }
      
      if (cardData.owner?.name) {
        popupInfo.append(createInfoString("Владелец:", cardData.owner.name));
      }
      
      popupInfo.append(createInfoString("Количество лайков:", cardData.likes.length));
      
      if (cardData.likes.length === 0) {
        if (popupText) popupText.textContent = "Лайкнули:";
        const emptyItem = document.createElement("li");
        emptyItem.textContent = "Нет лайков";
        emptyItem.classList.add("popup__list-item");
        popupList.append(emptyItem);
      } else {
        if (popupText) popupText.textContent = "Лайкнули:";
        cardData.likes.forEach((user) => {
          popupList.append(createUserItem(user.name));
        });
      }
    })
    .catch((err) => {
      console.error("Ошибка загрузки карточки:", err);
      popupTitle.textContent = "Ошибка загрузки";
      const errorItem = document.createElement("li");
      errorItem.textContent = "Не удалось загрузить данные";
      errorItem.classList.add("popup__list-item");
      popupList.append(errorItem);
    });
};


const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

enableValidation(validationConfig);


const cardHandlers = {
  onPreviewPicture: handlePreviewPicture,
  onLikeClick: handleLikeClick,
  onDeleteClick: handleDeleteClick,
  onInfoClick: handleInfoClick,  
};

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    currentUserId = userData._id;
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((card) => {
      const cardElement = createCardElement(card, {
        ...cardHandlers,
        currentUserId, 
      });
      placesWrap.append(cardElement);
    });
  })
  .catch((err) => console.error("Ошибка загрузки:", err));

  const handleCardFormSubmit = (evt) => {
    evt.preventDefault();
    const btn = evt.submitter;
    const originalText = btn.textContent;
    btn.textContent = "Создание...";
  
    addCard({ name: cardNameInput.value, link: cardLinkInput.value })
      .then((newCard) => {
        const cardElement = createCardElement(newCard, {
          ...cardHandlers,
          currentUserId, 
        });
        placesWrap.prepend(cardElement);
        closeModalWindow(cardFormModalWindow);
        cardForm.reset();
      })
      .catch((err) => console.error("Ошибка добавления:", err))
      .finally(() => (btn.textContent = originalText));
  };


const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const btn = evt.submitter;
  const originalText = btn.textContent;
  btn.textContent = "Сохранение...";

  setUserInfo({ name: profileTitleInput.value, about: profileDescriptionInput.value })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => console.error("Ошибка профиля:", err))
    .finally(() => (btn.textContent = originalText));
};

const handleAvatarSubmit = (evt) => {
  evt.preventDefault();
  const btn = evt.submitter;
  const originalText = btn.textContent;
  btn.textContent = "Сохранение...";

  setUserAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
      avatarForm.reset();
    })
    .catch((err) => console.error("Ошибка аватара:", err))
    .finally(() => (btn.textContent = originalText));
};

profileForm?.addEventListener("submit", handleProfileFormSubmit);
cardForm?.addEventListener("submit", handleCardFormSubmit);
avatarForm?.addEventListener("submit", handleAvatarSubmit);

openProfileFormButton?.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  openModalWindow(profileFormModalWindow);
});

openCardFormButton?.addEventListener("click", () => {
  cardForm.reset();
  openModalWindow(cardFormModalWindow);
});

profileAvatar?.addEventListener("click", () => {
  avatarForm.reset();
  openModalWindow(avatarFormModalWindow);
});

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => setCloseModalWindowEventListeners(popup));

//removeCardForm?.addEventListener("submit", handleConfirmDelete);

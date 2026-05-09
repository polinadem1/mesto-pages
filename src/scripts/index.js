import { createCardElement } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setUserAvatar,
  addCard,
  deleteCard as deleteCardApi,
  changeLikeCardStatus,
} from "./components/api.js";

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

// ========== ПОМОЩНИКИ ДЛЯ МОДАЛКИ ==========
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



// ========== ОСНОВНЫЕ ОБРАБОТЧИКИ ==========
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

const handleDeleteClick = (cardId, cardElement) => {
  deleteCardApi(cardId)
    .then(() => cardElement.remove())
    .catch((err) => console.error("Ошибка удаления:", err));
};

const handleInfoClick = (cardData) => {
  const popup = document.querySelector(".popup_type_info");
  const popupTitle = popup.querySelector(".popup__title");
  const popupInfo = popup.querySelector(".popup__info");
  const popupList = popup.querySelector(".popup__list");
  
  popupInfo.innerHTML = "";
  popupList.innerHTML = "";
  
  popupTitle.textContent = cardData.name;
  
  if (cardData.createdAt) {
    const date = new Date(cardData.createdAt);
    const formattedDate = date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    popupInfo.append(createInfoString("Дата создания:", formattedDate));
  }
  
  popupInfo.append(createInfoString("Количество лайков:", cardData.likes.length));
  
  if (cardData.likes.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = "Нет лайков";
    emptyItem.classList.add("popup__list-item");
    popupList.append(emptyItem);
  } else {
    cardData.likes.forEach((user) => {
      popupList.append(createUserItem(user.name));
    });
  }
  
  openModalWindow(popup);
};

// ========== ЗАГРУЗКА ДАННЫХ С СЕРВЕРА ==========
Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    currentUserId = userData._id;
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((card) => {
      const cardElement = createCardElement(card, {
        onPreviewPicture: handlePreviewPicture,
        onLikeClick: handleLikeClick,
        onDeleteClick: handleDeleteClick,
        onInfoClick: handleInfoClick,
        currentUserId,
      });
      placesWrap.append(cardElement);
    });
  })
  .catch((err) => console.error("Ошибка загрузки:", err));

// ========== ДОБАВЛЕНИЕ КАРТОЧКИ ==========
const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const btn = evt.submitter;
  const originalText = btn.textContent;
  btn.textContent = "Создание...";

  addCard({ name: cardNameInput.value, link: cardLinkInput.value })
    .then((newCard) => {
      const cardElement = createCardElement(newCard, {
        onPreviewPicture: handlePreviewPicture,
        onLikeClick: handleLikeClick,
        onDeleteClick: handleDeleteClick,
        onInfoClick: handleInfoClick,
        currentUserId,
      });
      placesWrap.prepend(cardElement);
      closeModalWindow(cardFormModalWindow);
      cardForm.reset();
    })
    .catch((err) => console.error("Ошибка добавления:", err))
    .finally(() => (btn.textContent = originalText));
};

// ========== РЕДАКТИРОВАНИЕ ПРОФИЛЯ ==========
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

// ========== ОБНОВЛЕНИЕ АВАТАРА ==========
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

// ========== EVENT LISTENERS ==========
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
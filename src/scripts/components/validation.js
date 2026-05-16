// src/scripts/components/validation.js

const getErrorMessage = (inputElement) => {
  if (inputElement.validity.valueMissing) {
    return "Вы пропустили это поле";
  }
  
  if (inputElement.validity.patternMismatch) {
    return inputElement.title || "Некорректный формат";
  }
  
  if (inputElement.validity.tooShort) {
    return `Минимум ${inputElement.minLength} символа`;
  }
  
  if (inputElement.validity.tooLong) {
    return `Максимум ${inputElement.maxLength} символов`;
  }
  
  if (inputElement.type === "url" && inputElement.validity.typeMismatch) {
    return "Введите корректный URL (например: https://example.com/image.jpg)";
  }
  
  if (inputElement.type === "url" && inputElement.value && !inputElement.value.startsWith('http')) {
    return "Ссылка должна начинаться с http:// или https://";
  }
  
  return inputElement.validationMessage;
};

const showInputError = (formElement, inputElement, config) => {
  const errorElement = formElement.querySelector(`.${inputElement.id}-error`);
  if (errorElement) {
    inputElement.classList.add(config.inputErrorClass);
    errorElement.textContent = getErrorMessage(inputElement);
    errorElement.classList.add(config.errorClass);
  }
};

const hideInputError = (formElement, inputElement, config) => {
  const errorElement = formElement.querySelector(`.${inputElement.id}-error`);
  if (errorElement) {
    inputElement.classList.remove(config.inputErrorClass);
    errorElement.textContent = "";
    errorElement.classList.remove(config.errorClass);
  }
};

const checkInputValidity = (formElement, inputElement, config) => {
  if (inputElement.validity.valid) {
    hideInputError(formElement, inputElement, config);
  } else {
    showInputError(formElement, inputElement, config);
  }
};

const hasInvalidInput = (inputList) => {
  return inputList.some((inputElement) => !inputElement.validity.valid);
};

const toggleButtonState = (inputList, buttonElement, config) => {
  if (hasInvalidInput(inputList)) {
    buttonElement.classList.add(config.inactiveButtonClass);
    buttonElement.disabled = true;
  } else {
    buttonElement.classList.remove(config.inactiveButtonClass);
    buttonElement.disabled = false;
  }
};

const setEventListeners = (formElement, config) => {
  const inputList = Array.from(formElement.querySelectorAll(config.inputSelector));
  const buttonElement = formElement.querySelector(config.submitButtonSelector);
  
  toggleButtonState(inputList, buttonElement, config);
  
  inputList.forEach((inputElement) => {
    inputElement.addEventListener("input", () => {
      checkInputValidity(formElement, inputElement, config);
      toggleButtonState(inputList, buttonElement, config);
    });
  });
};

export const enableValidation = (config) => {
  const formList = Array.from(document.querySelectorAll(config.formSelector));
  formList.forEach((formElement) => {
    setEventListeners(formElement, config);
  });
};
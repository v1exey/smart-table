import {createComparison, defaultRules} from "../lib/compare.js";

// @todo: #4.3 — настроить компаратор
const compare = createComparison(defaultRules);

export function initFiltering(elements, indexes) {
    // @todo: #4.1 — заполнить выпадающие списки опциями
    Object.keys(indexes).forEach((elementName) => {
    // Проверяем, существует ли такой элемент в шаблоне фильтра
    if (elements[elementName]) {
        elements[elementName].append(
            ...Object.values(indexes[elementName]).map(name => {
                const option = document.createElement('option');
                option.value = name;        // Значение, которое пойдет в state
                option.textContent = name;  // Текст, который увидит пользователь
                return option;
            })
        );
    }
});
    return (data, state, action) => {
        // @todo: #4.2 — обработать очистку поля
         if (action && action.name === 'clear') {
            // Находим родительский контейнер кнопки, чтобы искать внутри него
            const container = action.closest('div') || action.parentElement;
            const input = container.querySelector('input, select');

            if (input) {
                input.value = ''; // Очищаем визуально в браузере
                
                // Сбрасываем значение в объекте state, используя data-field кнопки
                const fieldName = action.dataset.field;
                if (fieldName) {
                    state[fieldName] = '';
                }
            }
        }
        // @todo: #4.5 — отфильтровать данные используя компаратор
        return data.filter(row => compare(row, state));
    }
}
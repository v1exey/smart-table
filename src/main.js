import './fonts/ys-display/fonts.css'
import './style.css'

import {data as sourceData} from "./data/dataset_1.js";

import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
// @todo: подключение
import {initPagination} from "./components/pagination.js";
import {initSorting} from "./components/sorting.js";
import {initFiltering} from "./components/filtering.js";
import {initSearching} from "./components/searching.js";

// Шаг 1. Присваиваем вызов функции константе api
const api = initData(sourceData);

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));
    const rowsPerPage = parseInt(state.rowsPerPage);    // приведём количество страниц к числу
    const page = parseInt(state.page ?? 1);                // номер страницы по умолчанию 1 и тоже число

    return {                                            // расширьте существующий return вот так
        ...state,
        rowsPerPage,
        page
    }; 
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * Функция стала асинхронной (async)
 * @param {HTMLButtonElement?} action
 */
async function render(action) {
    let state = collectState(); // состояние полей из таблицы
    // Шаг 2.1
    let query = {};
    // @todo: использование  ВРЕМЕННО ЗАКОММЕНТИРОВАНО ДЛЯ ШАГА 0
    query = applySearching(query, state, action);
    query = applyFiltering(query, state, action);
    query = applySorting(query, state, action);
    query = applyPagination(query, state, action); 
    // Шаг 2.2.
    const { total, items } = await api.getRecords(query);
    // Перерисовываем пагинатор и обновляем статусы (строки от-до), используя total от сервера
    updatePagination(total, query);
    // Шаг 2.3
    sampleTable.render(items)
}

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

// @todo: инициализация
const applySearching = initSearching('search');

// ЗАКОММЕНТИРОВАНО ДЛЯ ШАГА 0
// const applyFiltering = initFiltering(sampleTable.filter.elements, {    // передаём элементы фильтра
//    searchBySeller: indexes.sellers                                    // для элемента с именем searchBySeller устанавливаем массив продавцов
// });

// Шаг 3. Деструктурируем возвращаемый объект фильтрации
const {applyFiltering, updateIndexes} = initFiltering(sampleTable.filter.elements);

const applySorting = initSorting([        // Нам нужно передать сюда массив элементов, которые вызывают сортировку, чтобы изменять их визуальное представление
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);

const {applyPagination, updatePagination} = initPagination(
    sampleTable.pagination.elements,             // передаём сюда элементы пагинации, найденные в шаблоне
    (el, page, isCurrent) => {                    // и колбэк, чтобы заполнять кнопки страниц данными
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    }
);


const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

// Шаг 3
async function init() {
    // Шаг 3.1
    const indexes = await api.getIndexes();

    // Передаем элементы фильтра и конкретный индекс продавцов для выпадающего списка
    updateIndexes(sampleTable.filter.elements, {
        searchBySeller: indexes.sellers
    });
}

// Шаг 3.2
init().then(render);

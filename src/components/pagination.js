import {getPages} from "../lib/utils.js";

export const initPagination = ({pages, fromRow, toRow, totalRows}, createPage) => {
    // @todo: #2.3 — подготовить шаблон кнопки для страницы и очистить контейнер
    const pageTemplate = pages.firstElementChild.cloneNode(true);    // в качестве шаблона берём первый элемент
    pages.replaceChildren(); // очищаем контейнер от старых демо-данных

    let pageCount; // Временная переменная для хранения количества страниц

    const applyPagination = (query, state, action) => {
        const limit = state.rowsPerPage; // rowsPerPage переименовываем во внутренний limit для сервера
        let page = state.page;

        // @todo: #2.6 — обработать действия (переносим из старого кода)
        if (action) {
            switch(action.name) {
                case 'prev': page = Math.max(1, page - 1); break;            // переход на предыдущую страницу
                case 'next': page = Math.min(pageCount, page + 1); break;    // переход на следующую страницу
                case 'first': page = 1; break;                                // переход на первую страницу
                case 'last': page = pageCount; break;                        // переход на последнюю страницу
            }
        }

        // Возвращаем копию объекта query с добавленными параметрами limit и page
        return Object.assign({}, query, { 
            limit,
            page
        });
    }

    const updatePagination = (total, { page, limit }) => {
        pageCount = Math.ceil(total / limit); // Вычисляем общее количество страниц на основе total от сервера

        // @todo: #2.4 — получить список видимых страниц и вывести их (переносим из старого кода)
        const visiblePages = getPages(page, pageCount, 5);                // Получим массив страниц, выводим только 5 страниц
        pages.replaceChildren(...visiblePages.map(pageNumber => {        // перебираем их и создаём для них кнопку
            const el = pageTemplate.cloneNode(true);                    // клонируем шаблон
            return createPage(el, pageNumber, pageNumber === page);        // вызываем колбэк для заполнения
        }));

        // @todo: #2.5 — обновить статус пагинации (переносим, заменив rowsPerPage на limit)
        fromRow.textContent = (page - 1) * limit + 1;                    // С какой строки выводим
        toRow.textContent = Math.min((page * limit), total);             // До какой строки выводим (используем total вместо data.length)
        totalRows.textContent = total;                                   // Сколько всего строк на сервере
    }

    // Возвращаем объект с двумя функциями вместо одной старой
    return {
        updatePagination,
        applyPagination
    };
}
import {cloneTemplate} from "../lib/utils.js";

/**
 * Инициализирует таблицу и вызывает коллбэк при любых изменениях и нажатиях на кнопки
 *
 * @param {Object} settings
 * @param {(action: HTMLButtonElement | undefined) => void} onAction
 * @returns {{container: Node, elements: *, render: render}}
 */
export function initTable(settings, onAction) {
    const {tableTemplate, rowTemplate, before, after} = settings;
    const root = cloneTemplate(tableTemplate);

    // @todo: #1.2 —  вывести дополнительные шаблоны до и после таблицы
    // Добавляем элементы ПЕРЕД таблицей (в обратном порядке, чтобы сохранить логику очереди)
    before.reverse().forEach(subName => {
        root[subName] = cloneTemplate(subName);            // Клонируем и сохраняем в объект root
        root.container.prepend(root[subName].container);   // Добавляем В НАЧАЛО контейнера
    });

    // Добавляем элементы ПОСЛЕ таблицы
    after.forEach(subName => {
        root[subName] = cloneTemplate(subName);            // Клонируем и сохраняем в объект root
        root.container.append(root[subName].container);    // Добавляем В КОНЕЦ контейнера
    });
    
    // @todo: #1.3 —  обработать события и вызвать onAction()
    // 1. Событие изменения (например, выбор в select или ввод в input)
    root.container.addEventListener('change', () => {
        onAction(); 
    });

    // 2. Событие сброса формы (кнопка "Очистить")
    root.container.addEventListener('reset', () => {
        // Используем setTimeout, чтобы дождаться, пока браузер очистит поля, 
        // и только потом вызвать обновление данных
        setTimeout(onAction);
    });

    // 3. Событие отправки формы (кнопка "Поиск" или Enter)
    root.container.addEventListener('submit', (e) => {
        e.preventDefault();       // Отменяем перезагрузку страницы
        onAction(e.submitter);    // Передаем кнопку, которая вызвала отправку
    });

    const render = (data) => {
        // @todo: #1.1 — преобразовать данные в массив строк на основе шаблона rowTemplate
        const nextRows = data.map(item => {
            const row = cloneTemplate(rowTemplate);
            Object.keys(item).forEach(key => {
                const element = row.elements[key];
                
                if (element) {
                    // Проверяем, является ли элемент полем ввода или выбора
                    const isInput = element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA';

                    if (isInput) {
                        element.value = item[key];
                    } else {
                            element.textContent = item[key];
                    }     
                }
            });
            return row.container;
        });
        root.elements.rows.replaceChildren(...nextRows);
    }

    return {...root, render};
}
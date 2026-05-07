import {rules, createComparison} from "../lib/compare.js";


export function initSearching(searchField) {
    // @todo: #5.1 — настроить компаратор
    const compare = createComparison({
        [searchField]: rules.searchMultipleFields(
            searchField, 
            ['date', 'customer', 'seller'], 
            false
        )
    });
    

    return (data, state, action) => {
        // @todo: #5.2 — применить компаратор
        if (!state[searchField]) {
            return data;
        }
        return data.filter(row => compare(row, state));
    }
}
/* eslint-disable */
'use strict';
(function () {

    const TableFilter = (function (myArray) {
        let searchInput;
        console.log(myArray);
        function _onInputSearch(e) {
            searchInput = e.target;
            const tables = document.getElementsByClassName(searchInput.getAttribute('data-table'));
            myArray.forEach.call(tables, (table) => {
                myArray.forEach.call(table.tBodies, (tbody) => {
                    myArray.forEach.call(tbody.rows, (row) => {
                        const textContent = row.textContent.toLowerCase();
                        const searchVal = searchInput.value.toLowerCase();
                        row.style.display =textContent.indexOf(searchVal) > -1 ? '' : 'none';
                    });
                });
            });
        }

        return {
            init: function () {
                const inputs = document.getElementsByClassName('search-input');
                myArray.forEach.call(inputs, (input) => {
                    input.oninput = _onInputSearch;
                });
            }
        };
    })(Array.prototype);

    document.addEventListener('readystatechange', () => {
        if (document.readyState === 'complete') {
            TableFilter.init();
        }
    });

})();
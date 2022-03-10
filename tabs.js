// See https://www.w3.org/TR/wai-aria-practices-1.1/#tabpanel

const tagToTab = {
    H1:1,
    H2:1,
    H3:1,
    H4:1,
    H5:1,
    H6:1,
};

customElements.define('u1-tabs', class extends HTMLElement {

    constructor() {
        super();
        let shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.innerHTML = `
        <style>
        :host {
            display: flex;
            flex-direction:column;
        }
        #tabs {
            flex:0 0 auto;
            display:flex;
            overflow:hidden;
            scroll-padding: 3rem;
            /*
            scroll-snap-align: center;
            scroll-snap-type: x mandatory;
            */
        }
        #panels {
            display:grid;
            overflow:auto; /* chrome bug, overflow:auto works not on slot-items, zzz fixed in v94 */
            min-height: 0;
        }
        #panels::slotted(*)  {
            grid-area:1/1;
            opacity:1;
            visibility:visible;
            overflow:auto;
        }
        #panels::slotted([aria-hidden="true"]) {
            opacity:0;
            visibility:hidden;
            z-index:-1;
        }
        </style>
        <slot id=tabs name=title role=tablist></slot>
        <slot id=panels></slot>
        `;
        // Save refer to we can remove listeners later.
        this._onTitleClick = this._onTitleClick.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);

    }

    get selected() {
        return this._selected;
    }

    set selected(idx) {
        this._selected = idx;
        this._selectTab(idx);
        this.setAttribute('selected', idx);
    }

    connectedCallback() {
        const tabsSlot = this.shadowRoot.querySelector('#tabs');
        const panelsSlot = this.shadowRoot.querySelector('#panels');


        for (let child of this.children) {
            if (tagToTab[child.tagName]) {
                child.slot = 'title';
            }
        }

        this.tabs = tabsSlot.assignedNodes({flatten: true});
        this.panels = panelsSlot.assignedNodes({flatten: true}).filter(el => {
            return el.nodeType === Node.ELEMENT_NODE;
        });

        // Add aria role="tabpanel" to each content panel.
        for (let [i, panel] of this.panels.entries()) {
            panel.setAttribute('role', 'tabpanel');
            panel.setAttribute('tabindex', 0);
        }


        tabsSlot.addEventListener('click', this._onTitleClick);
        tabsSlot.addEventListener('keydown', this._onKeyDown);

        this.selected = this._findFirstSelectedTab() || 0;
    }

    disconnectedCallback() {
        const tabsSlot = this.shadowRoot.querySelector('#tabs');
        tabsSlot.removeEventListener('click', this._onTitleClick);
        tabsSlot.removeEventListener('keydown', this._onKeyDown);
    }

    _onTitleClick({target}) {
        if (target.slot === 'title') {
            this.selected = this.tabs.indexOf(target);
            target.focus();
        }
    }

    _onKeyDown(e) {
        switch (e.code) {
            case 'ArrowUp':
            case 'ArrowLeft':
                e.preventDefault();
                var idx = this.selected - 1;
                //idx = idx < 0 ? this.tabs.length - 1 : idx;
                this.tabs[idx] && this.tabs[idx].click();
                break;
            case 'ArrowDown':
            case 'ArrowRight':
                e.preventDefault();
                var idx = this.selected + 1;
                //this.tabs[idx % this.tabs.length].click();
                this.tabs[idx] && this.tabs[idx].click();
                break;
            default:
                break;
        }
    }

    _findFirstSelectedTab() {
        let selectedIdx;
        for (let [i, tab] of this.tabs.entries()) {
            tab.setAttribute('role', 'tab');
            if (tab.hasAttribute('selected')) selectedIdx = i; // select last [selected]
        }
        return selectedIdx;
    }

    _selectTab(idx = null) {
        for (let i = 0, tab; tab = this.tabs[i]; ++i) {
            let select = i === idx;
            tab.setAttribute('tabindex', select ? 0 : -1);
            tab.setAttribute('aria-selected', select);
            this.panels[i].setAttribute('aria-hidden', !select);
        }
    }

});

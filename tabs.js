let selected_ = null;

// See https://www.w3.org/TR/wai-aria-practices-1.1/#tabpanel

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
            overflow:auto;
        }
        #tabs::slotted(*) {
            font-size:1rem;
        }
        #panels {
            /*flex:1 1 auto; needed?*/
            display:grid;
            overflow:auto; /* chrome bug, overflow:auto works not on slot-items */
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
    }

    get selected() {
        return selected_;
    }

    set selected(idx) {
        selected_ = idx;
        this._selectTab(idx);
        this.setAttribute('selected', idx);
    }

    connectedCallback() {
        const tabsSlot = this.shadowRoot.querySelector('#tabs');
        const panelsSlot = this.shadowRoot.querySelector('#panels');
        this.tabs = tabsSlot.assignedNodes({flatten: true});
        this.panels = panelsSlot.assignedNodes({flatten: true}).filter(el => {
            return el.nodeType === Node.ELEMENT_NODE;
        });

        // Add aria role="tabpanel" to each content panel.
        for (let [i, panel] of this.panels.entries()) {
            panel.setAttribute('role', 'tabpanel');
            panel.setAttribute('tabindex', 0);
        }

        // Save refer to we can remove listeners later.
        this._boundOnTitleClick = this._onTitleClick.bind(this);
        this._boundOnKeyDown = this._onKeyDown.bind(this);

        tabsSlot.addEventListener('click', this._boundOnTitleClick);
        tabsSlot.addEventListener('keydown', this._boundOnKeyDown);

        this.selected = this._findFirstSelectedTab() || 0;
    }

    disconnectedCallback() {
        const tabsSlot = this.shadowRoot.querySelector('#tabs');
        tabsSlot.removeEventListener('click', this._boundOnTitleClick);
        tabsSlot.removeEventListener('keydown', this._boundOnKeyDown);
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

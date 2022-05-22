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
            overflow: auto;
            scroll-snap-type: x mandatory;
            scrollbar-width: none;  /* hide scrollbars Firefox */
        }
        #tabs::-webkit-scrollbar {
            display: none;  /* hide scrollbars (Safari and Chrome) */
        }
        #panels {
            display:grid;
            min-height: 0;
        }
        #panels::slotted(*)  {
            grid-area:1/1;
            overflow:auto;
            opacity:1;
            display:block;
        }
        #panels::slotted([hidden="until-found"]) {
            content-visibility: visible;
            opacity:0;
            z-index:-1;
        }
        </style>
        <slot part=tablist id=tabs name=title role=tablist></slot>
        <slot part=panels id=panels></slot>
        `;
        // Save refer to we can remove listeners later.
        this._onTitleClick = this._onTitleClick.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);

        this.addEventListener('beforematch', e=>{
            let el = e.target;
            while (el && el.parentNode) {
                if (el.parentNode === this) {
                    e.preventDefault();
                    this.selected = this.tabs.indexOf(el.previousElementSibling);
                    return;
                }
                el = el.parentElement;
            }
        })
    }

    get selected() {
        return this._selected;
    }

    set selected(index) {
        this._selected = index;
        this._selectTab(index);
        this.setAttribute('selected', index);
    }

    connectedCallback() {
        const tabsSlot = this.shadowRoot.querySelector('#tabs');
        const panelsSlot = this.shadowRoot.querySelector('#panels');


        for (let child of this.children) {
            if (tagToTab[child.tagName]) child.slot = 'title';
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

            // beta, should not be here but in "set selected"?
            let event = new CustomEvent('u1-activate', { bubbles: true, cancelable: true });
            target.dispatchEvent(event);
            if (event.defaultPrevented) return;

            this.selected = this.tabs.indexOf(target);
            target.focus();
            // target.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'center'}); // scrolls also the viewport...
        }
    }

    _onKeyDown(e) {
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        let index;
        switch (e.code) {
            case 'ArrowUp': case 'ArrowLeft':
                index = this.selected - 1;
                break;
            case 'ArrowDown': case 'ArrowRight':
                index = this.selected + 1;
                break;
            default:
                return
        }
        e.preventDefault();
        this.tabs[index] && this.tabs[index].click();

    }

    _findFirstSelectedTab() {
        let index;
        for (let [i, tab] of this.tabs.entries()) {
            tab.setAttribute('role', 'tab');
            if (tab.hasAttribute('selected')) index = i;
        }
        return index;
    }

    _selectTab(idx = null) {
        for (let i = 0, tab; tab = this.tabs[i]; ++i) {
            let select = i === idx;
            tab.setAttribute('tabindex', select ? 0 : -1);
            tab.setAttribute('aria-selected', select);
            if (select) {
                tab.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
            //this.panels[i].setAttribute('aria-hidden', !select);
            if (select) {
                this.panels[i].removeAttribute('hidden');
            } else {
                this.panels[i].setAttribute('hidden', 'until-found');
            }
        }
    }

});

// beta, does not work if initial u1-target is already fired
// problem: sometimes, on initial load, the event is fired before the listener is added
document.addEventListener('u1-target', e => {
    let tabs = document.querySelectorAll('u1-tabs > :target');
    for (let tab of tabs) tab.click();
});


/* slide
:host #panels {
    border: 2px solid;
    display:flex;
    overflow:hidden;
}
:host #panels::slotted(*) {
    flex:1 0 100%;
    opacity:1;
    visibility:visible;
}
_selectTab(idx = null) {
    for (let i = 0, tab; tab = this.tabs[i]; ++i) {
        ...
        //if (select) this.panels[i].scrollIntoView({behavior: 'smooth'});
    }
}
*/

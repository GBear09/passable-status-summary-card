/**
 * Universal Status Summary Card
 * A flexible summary card for entities like Vehicles and System Nodes.
 */

const CARD_VERSION = "1.0.3";

console.info(
  `%c  PASSABLE-STATUS-SUMMARY-CARD  %c v${CARD_VERSION} `,
  "color: white; font-weight: bold; background: #3498db; padding: 2px 5px; border-radius: 3px 0 0 3px;",
  "color: #3498db; font-weight: bold; background: #ecf0f1; padding: 2px 5px; border-radius: 0 3px 3px 0;"
);

const LitElement = Object.getPrototypeOf(
  customElements.get("hui-entities-card")
);
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

// --- VISUAL EDITOR ---
class StatusSummaryCardEditor extends LitElement {
  static get properties() {
    return { hass: {}, config: {}, _expandedItems: { type: Object }, _expandedAlerts: { type: Object }, _expandedQuickActions: { type: Object }, _expandedStatusIcons: { type: Object }, _expandedSections: { type: Object }, _users: { type: Array } };
  }

  constructor() {
    super();
    this._expandedItems = {};
    this._expandedAlerts = {};
    this._expandedQuickActions = {};
    this._expandedStatusIcons = {};
    this._expandedSections = { card_settings: true, background_settings: false, primary_info: false, secondary_info: false, status_icons: false, quick_actions: false, alerts: false };
    this._users = [];
  }

  connectedCallback() {
    super.connectedCallback();
    this._fetchUsers();
  }

  async _fetchUsers() {
    if (this.hass && this.hass.user && this.hass.user.is_admin) {
      try {
        const users = await this.hass.connection.sendMessagePromise({ type: "config/auth/list" });
        this._users = users.map(u => ({ label: u.name, value: u.id }));
        this.requestUpdate();
      } catch (e) {
        console.error("Failed to fetch users", e);
      }
    }
  }

  setConfig(config) {
    this.config = config;
  }

  _valueChanged(ev) {
    if (!this.config || !this.hass) return;
    
    const target = ev.target;
    let configValue = target.configValue;
    let newValue = ev.detail && ev.detail.value !== undefined ? ev.detail.value : target.value;
    
    if (!configValue) return;

    if (JSON.stringify(this.config[configValue]) === JSON.stringify(newValue)) return;

    if (newValue === "" || newValue === undefined || newValue === null || newValue === false) {
      const newConfig = { ...this.config };
      delete newConfig[configValue];
      this.config = newConfig;
    } else {
      this.config = { ...this.config, [configValue]: newValue };
    }

    this._fireConfigChange();
  }

  _fireConfigChange() {
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this.config }, bubbles: true, composed: true }));
  }

  _toggleAlert(index, ev) {
    if (ev) ev.stopPropagation();
    this._expandedAlerts = { ...(this._expandedAlerts || {}), [index]: !(this._expandedAlerts || {})[index] };
    this.requestUpdate();
  }

  _addAlert(ev) {
    if (ev) { ev.stopPropagation(); ev.preventDefault(); }
    const newAlerts = [...(this.config.alerts || []), { entity: '', state: '' }];
    this.config = { ...this.config, alerts: newAlerts };
    this._expandedAlerts = { ...(this._expandedAlerts || {}), [newAlerts.length - 1]: true };
    this.requestUpdate();
    this._fireConfigChange();
  }

  _removeAlert(index, ev) {
    if (ev) { ev.stopPropagation(); ev.preventDefault(); }
    const newAlerts = [...(this.config.alerts || [])];
    newAlerts.splice(index, 1);
    this.config = { ...this.config, alerts: newAlerts };
    this.requestUpdate();
    this._fireConfigChange();
  }

  _updateAlert(index, field, value) {
    const newAlerts = [...(this.config.alerts || [])];
    if (value === undefined || value === "") {
        delete newAlerts[index][field];
    } else {
        newAlerts[index][field] = value;
    }
    this.config = { ...this.config, alerts: newAlerts };
    this.requestUpdate();
    this._fireConfigChange();
  }

  _toggleQuickAction(index, ev) {
    if (ev) ev.stopPropagation();
    this._expandedQuickActions = { ...this._expandedQuickActions, [index]: !this._expandedQuickActions[index] };
  }

  _addQuickAction() {
    const newActions = [...(this.config.quick_actions || []), { icon: "" }];
    this.config = { ...this.config, quick_actions: newActions };
    this._expandedQuickActions = { ...this._expandedQuickActions, [newActions.length - 1]: true };
    this.requestUpdate();
    this._fireConfigChange();
  }

  _removeQuickAction(index) {
    const newActions = [...(this.config.quick_actions || [])];
    newActions.splice(index, 1);
    this.config = { ...this.config, quick_actions: newActions };
    this.requestUpdate();
    this._fireConfigChange();
  }

  _updateQuickAction(index, field, value) {
    const newActions = [...(this.config.quick_actions || [])];
    if (value === undefined || value === "") {
        delete newActions[index][field];
    } else {
        newActions[index][field] = value;
    }
    this.config = { ...this.config, quick_actions: newActions };
    this._fireConfigChange();
  }

  _toggleSection(section, ev) {
    if (ev) ev.stopPropagation();
    this._expandedSections = { ...this._expandedSections, [section]: !this._expandedSections[section] };
    this.requestUpdate();
  }

  _toggleStatusIcon(index, ev) {
    if (ev) ev.stopPropagation();
    this._expandedStatusIcons = { ...this._expandedStatusIcons, [index]: !this._expandedStatusIcons[index] };
    this.requestUpdate();
  }

  _addStatusIcon() {
    const newIcons = [...(this.config.status_icons || []), ""]; // Add empty string for backwards compat
    this.config = { ...this.config, status_icons: newIcons };
    this._expandedStatusIcons = { ...this._expandedStatusIcons, [newIcons.length - 1]: true };
    this.requestUpdate();
    this._fireConfigChange();
  }

  _removeStatusIcon(index) {
    const newIcons = [...(this.config.status_icons || [])];
    newIcons.splice(index, 1);
    this.config = { ...this.config, status_icons: newIcons };
    this.requestUpdate();
    this._fireConfigChange();
  }

  _updateStatusIcon(index, field, value) {
    const newIcons = [...(this.config.status_icons || [])];
    
    // If it's a string currently, convert to object
    if (typeof newIcons[index] === 'string') {
        newIcons[index] = { entity: newIcons[index] };
    }
    
    if (value === undefined || value === "") {
        delete newIcons[index][field];
    } else {
        newIcons[index][field] = value;
    }
    this.config = { ...this.config, status_icons: newIcons };
    this.requestUpdate();
    this._fireConfigChange();
  }

  _toggleItem(index, ev) {
    if (ev) ev.stopPropagation();
    this._expandedItems = { ...this._expandedItems, [index]: !this._expandedItems[index] };
  }

  _addSecondaryInfo() {
    const newInfo = [...(this.config.secondary_info || []), { entity: "" }];
    this.config = { ...this.config, secondary_info: newInfo };
    this._expandedItems = { ...this._expandedItems, [newInfo.length - 1]: true };
    this.requestUpdate();
    this._fireConfigChange();
  }

  _removeSecondaryInfo(index) {
    const newInfo = [...(this.config.secondary_info || [])];
    newInfo.splice(index, 1);
    this.config = { ...this.config, secondary_info: newInfo };
    this.requestUpdate();
    this._fireConfigChange();
  }

  _moveSecondaryInfoUp(index) {
    if (index === 0) return;
    const newInfo = [...(this.config.secondary_info || [])];
    const temp = newInfo[index - 1];
    newInfo[index - 1] = newInfo[index];
    newInfo[index] = temp;
    this.config = { ...this.config, secondary_info: newInfo };
    
    const exp1 = this._expandedItems[index - 1];
    const exp2 = this._expandedItems[index];
    this._expandedItems = { ...this._expandedItems, [index - 1]: exp2, [index]: exp1 };
    
    this._fireConfigChange();
  }

  _moveSecondaryInfoDown(index) {
    const newInfo = [...(this.config.secondary_info || [])];
    if (index === newInfo.length - 1) return;
    const temp = newInfo[index + 1];
    newInfo[index + 1] = newInfo[index];
    newInfo[index] = temp;
    this.config = { ...this.config, secondary_info: newInfo };
    
    const exp1 = this._expandedItems[index];
    const exp2 = this._expandedItems[index + 1];
    this._expandedItems = { ...this._expandedItems, [index]: exp2, [index + 1]: exp1 };
    
    this._fireConfigChange();
  }

  _updateSecondaryInfo(index, field, value) {
    const newInfo = [...(this.config.secondary_info || [])];
    if (value === undefined || value === "") {
        delete newInfo[index][field];
    } else {
        newInfo[index][field] = value;
    }
    this.config = { ...this.config, secondary_info: newInfo };
    this._fireConfigChange();
  }

  _addColorMap(ev) {
    if (ev) { ev.stopPropagation(); ev.preventDefault(); }
    const newColorMap = [...(this.config.color_map || []), { state: '', color: '', intensity: 20 }];
    this.config = { ...this.config, color_map: newColorMap };
    this.requestUpdate();
    this._fireConfigChange();
  }

  _removeColorMap(index, ev) {
    if (ev) { ev.stopPropagation(); ev.preventDefault(); }
    const newColorMap = [...(this.config.color_map || [])];
    newColorMap.splice(index, 1);
    this.config = { ...this.config, color_map: newColorMap };
    this.requestUpdate();
    this._fireConfigChange();
  }

  _updateColorMap(index, field, value) {
    const newColorMap = [...(this.config.color_map || [])];
    if (value === undefined || value === "") {
        delete newColorMap[index][field];
    } else {
        newColorMap[index][field] = value;
    }
    this.config = { ...this.config, color_map: newColorMap };
    this.requestUpdate();
    this._fireConfigChange();
  }

  render() {
    if (!this.hass || !this.config) return html``;

    const secondaryInfo = this.config.secondary_info || [];
    
    let primaryAttributes = [];
    if (this.config.primary_info?.entity && this.hass.states[this.config.primary_info.entity]) {
        primaryAttributes = Object.keys(this.hass.states[this.config.primary_info.entity].attributes);
    }
    const primaryAttributeOptions = [
        { label: "Main State", value: "state" },
        ...primaryAttributes.map(attr => ({ label: attr, value: attr }))
    ];

    const extraOptionsBase = [
        { label: "Last Changed", value: "last_changed" },
        { label: "Last Updated", value: "last_updated" },
    ];
    const primaryExtraOptions = [...extraOptionsBase, ...primaryAttributes.map(attr => ({ label: attr, value: attr }))];

    const colorMapThemeOptions = [
        { label: "Primary Color", value: "var(--primary-color)" },
        { label: "Accent Color", value: "var(--accent-color)" },
        { label: "Success Color", value: "var(--success-color)" },
        { label: "Warning Color", value: "var(--warning-color)" },
        { label: "Error Color", value: "var(--error-color)" },
        { label: "Info Color", value: "var(--info-color)" },
        { label: "Card Background (Default)", value: "var(--ha-card-background, var(--card-background-color, white))" }
    ];

    const renderSectionHeader = (id, title, extraBtn) => html`
        <div class="section-header" @click=${(ev) => this._toggleSection(id, ev)} style="cursor: pointer; user-select: none;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <ha-icon icon="${this._expandedSections[id] ? 'mdi:chevron-down' : 'mdi:chevron-right'}"></ha-icon>
                <h3 style="margin: 0; pointer-events: none;">${title}</h3>
            </div>
            ${extraBtn || ''}
        </div>
    `;

    return html`
      <div class="card-config">
        <!-- 1. CARD SETTINGS -->
        ${renderSectionHeader('card_settings', 'Card Settings')}
        <div style="display: ${this._expandedSections.card_settings ? 'block' : 'none'};">
            <ha-selector
            .hass=${this.hass}
            .selector=${{ text: {} }}
            .value=${this.config.title || ""}
            .label=${"Card Title"}
            .configValue=${"title"}
            @value-changed=${this._valueChanged}
            ></ha-selector>
            
            <ha-selector
            .hass=${this.hass}
            .selector=${{ icon: {} }}
            .value=${this.config.icon || ""}
            .label=${"Card Icon (Overrides State Icon)"}
            .configValue=${"icon"}
            @value-changed=${this._valueChanged}
            ></ha-selector>
            
            <ha-selector
            .hass=${this.hass}
            .selector=${{ text: {} }}
            .value=${this.config.image || ""}
            .label=${"Card Image URL or Path (Overrides Icon entirely)"}
            .configValue=${"image"}
            @value-changed=${this._valueChanged}
            ></ha-selector>

            <ha-selector
            .hass=${this.hass}
            .selector=${{ ui_action: {} }}
            .value=${this.config.tap_action || { action: "more-info" }}
            .label=${"Tap Action"}
            .configValue=${"tap_action"}
            @value-changed=${this._valueChanged}
            ></ha-selector>
        </div>

        <!-- 2. BACKGROUND SETTINGS -->
        ${renderSectionHeader('background_settings', 'Background Settings', html`<ha-button @click=${(ev) => { ev.stopPropagation(); this._addColorMap(ev); }}>Add Color Map</ha-button>`)}
        <div style="display: ${this._expandedSections.background_settings ? 'block' : 'none'};">
            <p><i>Upload or select a custom image to fill the background of the entire card.</i></p>
            <ha-selector
            .hass=${this.hass}
            .selector=${{ text: {} }}
            .value=${this.config.background_image || ""}
            .label=${"Background Image URL or Path (/local/bg.jpg)"}
            .configValue=${"background_image"}
            @value-changed=${this._valueChanged}
            ></ha-selector>

            <h4 style="margin-top: 24px;">Dynamic Card Background Colors</h4>
            <p><i>Change the entire card background color dynamically based on the Primary Entity's state.</i></p>
            ${(this.config.color_map || []).map((cmap, index) => html`
                <div class="item-container" style="border: 1px solid var(--divider-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                    <div class="item-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; cursor: default;">
                        <h4 style="margin: 0;">Color Map ${index + 1}</h4>
                            <div class="item-actions" @click=${(ev) => ev.stopPropagation()}>
                                <ha-icon icon="mdi:delete" @click=${(ev) => this._removeColorMap(index, ev)} style="cursor: pointer; padding: 8px;"></ha-icon>
                            </div>
                    </div>
                    <div class="side-by-side">
                        <ha-selector
                            .hass=${this.hass}
                            .selector=${{ text: {} }}
                            .value=${cmap.state || ""}
                            .label=${"Entity State"}
                            @value-changed=${(ev) => this._updateColorMap(index, 'state', ev.detail.value)}
                        ></ha-selector>
                        <ha-selector
                            .hass=${this.hass}
                            .selector=${{ select: { options: colorMapThemeOptions, custom_value: true } }}
                            .value=${cmap.color || ""}
                            .label=${"Background Color"}
                            @value-changed=${(ev) => this._updateColorMap(index, 'color', ev.detail.value)}
                        ></ha-selector>
                    </div>
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{ number: { mode: "slider", min: 0, max: 100, step: 1 } }}
                        .value=${cmap.intensity ?? 20}
                        .label=${"Color Intensity / Opacity (%)"}
                        @value-changed=${(ev) => this._updateColorMap(index, 'intensity', ev.detail.value)}
                        style="margin-top: 8px;"
                    ></ha-selector>
                </div>
            `)}
        </div>

        <!-- 3. PRIMARY INFORMATION -->
        ${renderSectionHeader('primary_info', 'Primary Information')}
        <div style="display: ${this._expandedSections.primary_info ? 'block' : 'none'};">
            <ha-selector
            .hass=${this.hass}
            .selector=${{ entity: {} }}
            .value=${this.config.primary_info?.entity || ""}
            .label=${"Primary Entity"}
            @value-changed=${(ev) => {
                const val = ev.detail.value;
                const primary_info = { ...this.config.primary_info, entity: val };
                this.config = { ...this.config, primary_info };
                this._fireConfigChange();
            }}
            ></ha-selector>
            
            <div class="side-by-side">
            <ha-selector
                .hass=${this.hass}
                .selector=${{ text: {} }}
                .value=${this.config.primary_info?.name || ""}
                .label=${"Name (Optional)"}
                @value-changed=${(ev) => {
                const val = ev.detail.value;
                const primary_info = { ...this.config.primary_info, name: val };
                this.config = { ...this.config, primary_info };
                this._fireConfigChange();
                }}
            ></ha-selector>
            <ha-selector
                .hass=${this.hass}
                .selector=${{ select: { options: primaryAttributeOptions, custom_value: true } }}
                .value=${this.config.primary_info?.attribute || "state"}
                .label=${"Attribute (Optional)"}
                @value-changed=${(ev) => {
                const val = ev.detail.value === 'state' ? '' : ev.detail.value;
                const primary_info = { ...this.config.primary_info, attribute: val };
                this.config = { ...this.config, primary_info };
                this._fireConfigChange();
                }}
            ></ha-selector>
            </div>
            
            <div class="side-by-side" style="margin-top: 16px;">
                <ha-selector
                    .hass=${this.hass}
                    .selector=${{ text: {} }}
                    .value=${this.config.primary_info?.unit || ""}
                    .label=${"Unit (Optional)"}
                    @value-changed=${(ev) => {
                    const val = ev.detail.value;
                    const primary_info = { ...this.config.primary_info, unit: val };
                    this.config = { ...this.config, primary_info };
                    this._fireConfigChange();
                    }}
                ></ha-selector>
                <div style="display: flex; align-items: center;">
                    <ha-formfield .label=${"Hide Name entirely"}>
                        <ha-switch
                            .checked=${this.config.primary_info?.hide_name || false}
                            @change=${(ev) => {
                                const primary_info = { ...this.config.primary_info, hide_name: ev.target.checked };
                                this.config = { ...this.config, primary_info };
                                this._fireConfigChange();
                            }}
                        ></ha-switch>
                    </ha-formfield>
                </div>
            </div>
            
            <ha-selector
            .hass=${this.hass}
            .selector=${{ select: { options: primaryExtraOptions, multiple: true, custom_value: true } }}
            .value=${this.config.primary_info?.extra_info || []}
            .label=${"Sub-labels (Extra Info)"}
            @value-changed=${(ev) => {
                const val = ev.detail.value;
                const primary_info = { ...this.config.primary_info, extra_info: val };
                this.config = { ...this.config, primary_info };
                this._fireConfigChange();
            }}
            ></ha-selector>

            <ha-formfield .label=${"Plot History in Background"}>
            <ha-switch
                .checked=${this.config.primary_info?.show_history || false}
                @change=${(ev) => {
                const primary_info = { ...this.config.primary_info, show_history: ev.target.checked };
                this.config = { ...this.config, primary_info };
                this._fireConfigChange();
                }}
            ></ha-switch>
            </ha-formfield>

            ${this.config.primary_info?.show_history ? html`
            <ha-selector
                .hass=${this.hass}
                .selector=${{ number: { mode: "box", step: 1 } }}
                .value=${this.config.primary_info?.history_hours ?? 12}
                .label=${"History Timeframe (Hours)"}
                @value-changed=${(ev) => {
                const primary_info = { ...this.config.primary_info, history_hours: ev.detail.value };
                this.config = { ...this.config, primary_info };
                this._fireConfigChange();
                }}
                style="margin-top: 16px;"
            ></ha-selector>
            ` : ''}

            <ha-formfield .label=${"Show Primary Value as a Bar Gauge"} style="margin-top: 16px;">
            <ha-switch
                .checked=${this.config.primary_info?.show_gauge || false}
                @change=${(ev) => {
                const primary_info = { ...this.config.primary_info, show_gauge: ev.target.checked };
                this.config = { ...this.config, primary_info };
                this._fireConfigChange();
                }}
            ></ha-switch>
            </ha-formfield>

            ${this.config.primary_info?.show_gauge ? html`
            <div class="side-by-side" style="margin-top: 16px;">
                <ha-selector
                .hass=${this.hass}
                .selector=${{ number: { mode: "box", step: 1 } }}
                .value=${this.config.primary_info?.gauge_min ?? 0}
                .label=${"Gauge Minimum"}
                @value-changed=${(ev) => {
                    const primary_info = { ...this.config.primary_info, gauge_min: ev.detail.value };
                    this.config = { ...this.config, primary_info };
                    this._fireConfigChange();
                }}
                ></ha-selector>
                <ha-selector
                .hass=${this.hass}
                .selector=${{ number: { mode: "box", step: 1 } }}
                .value=${this.config.primary_info?.gauge_max ?? 100}
                .label=${"Gauge Maximum"}
                @value-changed=${(ev) => {
                    const primary_info = { ...this.config.primary_info, gauge_max: ev.detail.value };
                    this.config = { ...this.config, primary_info };
                    this._fireConfigChange();
                }}
                ></ha-selector>
            </div>
            ` : ''}
        </div>

        <!-- 4. SECONDARY INFORMATION -->
        ${renderSectionHeader('secondary_info', 'Secondary Information', html`<ha-button @click=${(ev) => { ev.stopPropagation(); this._addSecondaryInfo(); }}>Add Item</ha-button>`)}
        <div style="display: ${this._expandedSections.secondary_info ? 'block' : 'none'};">
            <ha-selector
            .hass=${this.hass}
            .selector=${{ select: { options: [{label: "List (Default)", value: "list"}, {label: "Grid (Dense)", value: "grid"}, {label: "Rings (Compact Gauges)", value: "rings"}], mode: "dropdown" } }}
            .value=${this.config.secondary_layout || "list"}
            .label=${"Secondary Layout Style"}
            .configValue=${"secondary_layout"}
            @value-changed=${this._valueChanged}
            ></ha-selector>
            
            <div class="list-editor">
                ${secondaryInfo.map((info, index) => {
                const entityId = info.entity;
                let attributes = [];
                if (entityId && this.hass.states[entityId]) {
                    attributes = Object.keys(this.hass.states[entityId].attributes);
                }
                
                const attributeOptions = [
                    { label: "Main State", value: "state" },
                    ...attributes.map(attr => ({ label: attr, value: attr }))
                ];
                const extraOptionsBase = [
                    { label: "Last Changed", value: "last_changed" },
                    { label: "Last Updated", value: "last_updated" },
                ];
                const secondaryExtraOptions = [...extraOptionsBase, ...attributes.map(attr => ({ label: attr, value: attr }))];

                const isExpanded = this._expandedItems[index];
                const headerTitle = info.name || info.entity || 'Item ' + (index + 1);

                return html`
                    <div class="list-item">
                        <div class="item-header" @click=${(ev) => this._toggleItem(index, ev)} style="cursor: pointer; margin-bottom: ${isExpanded ? '12px' : '0'};">
                            <div style="display: flex; align-items: center; gap: 4px; overflow: hidden;">
                                <svg viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: currentColor; flex-shrink: 0;">
                                    <path d="${isExpanded ? 'M7.41,8.59L12,13.17L16.59,8.59L18,10L12,16L6,10L7.41,8.59Z' : 'M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z'}"></path>
                                </svg>
                                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.95em;">${headerTitle}</span>
                            </div>
                            <div class="item-actions" @click=${(ev) => ev.stopPropagation()}>
                                <ha-icon-button
                                    .label=${"Move Up"}
                                    .path=${"M13,18V10L16.5,13.5L17.92,12.08L12,6.16L6.08,12.08L7.5,13.5L11,10V18H13Z"}
                                    @click=${() => this._moveSecondaryInfoUp(index)}
                                    ?disabled=${index === 0}
                                ></ha-icon-button>
                                <ha-icon-button
                                    .label=${"Move Down"}
                                    .path=${"M11,6V14L7.5,10.5L6.08,11.92L12,17.84L17.92,11.92L16.5,10.5L13,14V6H11Z"}
                                    @click=${() => this._moveSecondaryInfoDown(index)}
                                    ?disabled=${index === secondaryInfo.length - 1}
                                ></ha-icon-button>
                                <ha-icon-button
                                    .label=${"Remove"}
                                    .path=${"M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"}
                                    @click=${() => this._removeSecondaryInfo(index)}
                                ></ha-icon-button>
                            </div>
                        </div>
                        
                        <div style="display: ${isExpanded ? 'block' : 'none'};">
                            <ha-selector
                                .hass=${this.hass}
                                .selector=${{ entity: {} }}
                            .value=${info.entity || ""}
                            .label=${"Entity"}
                            @value-changed=${(ev) => this._updateSecondaryInfo(index, 'entity', ev.detail.value)}
                        ></ha-selector>
                        
                        <ha-selector
                            .hass=${this.hass}
                            .selector=${{ select: { options: attributeOptions, mode: "dropdown", custom_value: true } }}
                            .value=${info.attribute || "state"}
                            .label=${"Value to Display (State or Attribute)"}
                            @value-changed=${(ev) => this._updateSecondaryInfo(index, 'attribute', ev.detail.value === 'state' ? undefined : ev.detail.value)}
                        ></ha-selector>
                        
                        <div class="side-by-side">
                            <ha-selector
                                .hass=${this.hass}
                                .selector=${{ text: {} }}
                                .value=${info.name || ""}
                                .label=${"Name (Optional)"}
                                @value-changed=${(ev) => this._updateSecondaryInfo(index, 'name', ev.detail.value)}
                            ></ha-selector>
                            <ha-selector
                                .hass=${this.hass}
                                .selector=${{ text: {} }}
                                .value=${info.unit || ""}
                                .label=${"Custom Unit"}
                                @value-changed=${(ev) => this._updateSecondaryInfo(index, 'unit', ev.detail.value)}
                            ></ha-selector>
                        </div>

                        <ha-selector
                            .hass=${this.hass}
                            .selector=${{ select: { options: secondaryExtraOptions, multiple: true, custom_value: true } }}
                            .value=${info.extra_info || []}
                            .label=${"Sub-labels (Extra Info)"}
                            @value-changed=${(ev) => this._updateSecondaryInfo(index, 'extra_info', ev.detail.value)}
                        ></ha-selector>
                        
                        <ha-selector
                            .hass=${this.hass}
                            .selector=${{ icon: {} }}
                            .value=${info.icon || ""}
                            .label=${"Icon (Optional)"}
                            @value-changed=${(ev) => this._updateSecondaryInfo(index, 'icon', ev.detail.value)}
                        ></ha-selector>

                        <div class="side-by-side" style="margin-top: 16px;">
                            <ha-formfield .label=${"Show Value as a Gauge"}>
                                <ha-switch
                                    .checked=${info.show_gauge || false}
                                    @change=${(ev) => this._updateSecondaryInfo(index, 'show_gauge', ev.target.checked)}
                                ></ha-switch>
                            </ha-formfield>
                            <ha-formfield .label=${"Hide Icon"}>
                                <ha-switch
                                    .checked=${info.hide_icon || false}
                                    @change=${(ev) => this._updateSecondaryInfo(index, 'hide_icon', ev.target.checked)}
                                ></ha-switch>
                            </ha-formfield>
                            <ha-formfield .label=${"Hide Name"}>
                                <ha-switch
                                    .checked=${info.hide_name || false}
                                    @change=${(ev) => this._updateSecondaryInfo(index, 'hide_name', ev.target.checked)}
                                ></ha-switch>
                            </ha-formfield>
                        </div>

                        ${info.show_gauge ? html`
                        <div class="side-by-side" style="margin-top: 16px;">
                            <ha-selector
                            .hass=${this.hass}
                            .selector=${{ number: { mode: "box", step: 1 } }}
                            .value=${info.gauge_min ?? 0}
                            .label=${"Gauge Min"}
                            @value-changed=${(ev) => this._updateSecondaryInfo(index, 'gauge_min', ev.detail.value)}
                            ></ha-selector>
                            <ha-selector
                            .hass=${this.hass}
                            .selector=${{ number: { mode: "box", step: 1 } }}
                            .value=${info.gauge_max ?? 100}
                            .label=${"Gauge Max"}
                            @value-changed=${(ev) => this._updateSecondaryInfo(index, 'gauge_max', ev.detail.value)}
                            ></ha-selector>
                        </div>
                        ` : ''}
                        </div>
                    </div>
                `;
                })}
            </div>
        </div>

        <!-- 5. STATUS ICONS -->
        ${renderSectionHeader('status_icons', 'Status Icons', html`<ha-button @click=${(ev) => { ev.stopPropagation(); this._addStatusIcon(); }}>Add Icon</ha-button>`)}
        <div style="display: ${this._expandedSections.status_icons ? 'block' : 'none'};">
            <p><i>Add entities to display as small icons in the top right corner. You can use standard state icons or customize the icons and colors completely!</i></p>
            
            <ha-formfield .label=${"Only show icons when state is active (e.g. 'home' or 'on')"}>
            <ha-switch
                .checked=${this.config.status_icons_active_only || false}
                @change=${(ev) => {
                this.config = { ...this.config, status_icons_active_only: ev.target.checked };
                this._fireConfigChange();
                }}
            ></ha-switch>
            </ha-formfield>

            <div class="list-editor" style="margin-top: 16px;">
                ${(this.config.status_icons || []).map((iconObj, index) => {
                const isString = typeof iconObj === 'string';
                const entityId = isString ? iconObj : iconObj.entity;
                const isExpanded = this._expandedStatusIcons[index];
                const headerTitle = entityId || 'Icon ' + (index + 1);

                return html`
                    <div class="list-item">
                        <div class="item-header" @click=${(ev) => this._toggleStatusIcon(index, ev)} style="cursor: pointer; margin-bottom: ${isExpanded ? '12px' : '0'};">
                            <div style="display: flex; align-items: center; gap: 4px; overflow: hidden;">
                                <svg viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: currentColor; flex-shrink: 0;">
                                    <path d="${isExpanded ? 'M7.41,8.59L12,13.17L16.59,8.59L18,10L12,16L6,10L7.41,8.59Z' : 'M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z'}"></path>
                                </svg>
                                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.95em;">${headerTitle}</span>
                            </div>
                            <div class="item-actions" @click=${(ev) => ev.stopPropagation()}>
                                <ha-icon-button
                                    .label=${"Remove"}
                                    .path=${"M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"}
                                    @click=${() => this._removeStatusIcon(index)}
                                ></ha-icon-button>
                            </div>
                        </div>
                        
                        <div style="display: ${isExpanded ? 'block' : 'none'};">
                            <ha-selector
                                .hass=${this.hass}
                                .selector=${{ entity: {} }}
                                .value=${entityId || ""}
                                .label=${"Entity"}
                                @value-changed=${(ev) => this._updateStatusIcon(index, 'entity', ev.detail.value)}
                            ></ha-selector>
                            
                            <div class="side-by-side" style="margin-top: 16px;">
                                <ha-selector
                                    .hass=${this.hass}
                                    .selector=${{ icon: {} }}
                                    .value=${isString ? "" : (iconObj.icon_on || "")}
                                    .label=${"Icon (On State)"}
                                    @value-changed=${(ev) => this._updateStatusIcon(index, 'icon_on', ev.detail.value)}
                                ></ha-selector>
                                <ha-selector
                                    .hass=${this.hass}
                                    .selector=${{ icon: {} }}
                                    .value=${isString ? "" : (iconObj.icon_off || "")}
                                    .label=${"Icon (Off State)"}
                                    @value-changed=${(ev) => this._updateStatusIcon(index, 'icon_off', ev.detail.value)}
                                ></ha-selector>
                            </div>
                            
                            <div class="side-by-side" style="margin-top: 16px;">
                                <ha-selector
                                    .hass=${this.hass}
                                    .selector=${{ select: { options: colorMapThemeOptions, custom_value: true } }}
                                    .value=${isString ? "" : (iconObj.icon_color_on || "")}
                                    .label=${"Icon Color (On State)"}
                                    @value-changed=${(ev) => this._updateStatusIcon(index, 'icon_color_on', ev.detail.value)}
                                ></ha-selector>
                                <ha-selector
                                    .hass=${this.hass}
                                    .selector=${{ select: { options: colorMapThemeOptions, custom_value: true } }}
                                    .value=${isString ? "" : (iconObj.icon_color_off || "")}
                                    .label=${"Icon Color (Off State)"}
                                    @value-changed=${(ev) => this._updateStatusIcon(index, 'icon_color_off', ev.detail.value)}
                                ></ha-selector>
                            </div>
                        </div>
                    </div>
                `;
                })}
            </div>
        </div>

        <!-- 6. QUICK ACTIONS -->
        ${renderSectionHeader('quick_actions', 'Quick Actions', html`<ha-button @click=${(ev) => { ev.stopPropagation(); this._addQuickAction(); }}>Add Action</ha-button>`)}
        <div style="display: ${this._expandedSections.quick_actions ? 'block' : 'none'};">
            <p><i>Add actionable buttons below the main title.</i></p>
            <div class="list-editor">
                ${(this.config.quick_actions || []).map((action, index) => {
                const isExpanded = this._expandedQuickActions[index];
                const headerTitle = action.name || 'Action ' + (index + 1);

                return html`
                    <div class="list-item">
                        <div class="item-header" @click=${(ev) => this._toggleQuickAction(index, ev)} style="cursor: pointer; margin-bottom: ${isExpanded ? '12px' : '0'};">
                            <div style="display: flex; align-items: center; gap: 4px; overflow: hidden;">
                                <svg viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: currentColor; flex-shrink: 0;">
                                    <path d="${isExpanded ? 'M7.41,8.59L12,13.17L16.59,8.59L18,10L12,16L6,10L7.41,8.59Z' : 'M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z'}"></path>
                                </svg>
                                ${action.icon ? html`<ha-icon icon="${action.icon}" style="margin-right: 8px;"></ha-icon>` : ''}
                                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.95em;">${headerTitle}</span>
                            </div>
                            <div class="item-actions" @click=${(ev) => ev.stopPropagation()}>
                                <ha-icon-button
                                    .label=${"Remove"}
                                    .path=${"M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"}
                                    @click=${() => this._removeQuickAction(index)}
                                ></ha-icon-button>
                            </div>
                        </div>
                        
                        <div style="display: ${isExpanded ? 'block' : 'none'};">
                            <ha-selector
                                .hass=${this.hass}
                                .selector=${{ entity: {} }}
                                .value=${action.entity || ""}
                                .label=${"Entity (Optional, for dynamic state)"}
                                @value-changed=${(ev) => this._updateQuickAction(index, 'entity', ev.detail.value)}
                            ></ha-selector>

                            ${!action.entity ? html`
                                <ha-selector
                                    .hass=${this.hass}
                                    .selector=${{ icon: {} }}
                                    .value=${action.icon || ""}
                                    .label=${"Static Icon"}
                                    @value-changed=${(ev) => this._updateQuickAction(index, 'icon', ev.detail.value)}
                                    style="margin-top: 16px;"
                                ></ha-selector>
                            ` : html`
                                <div class="side-by-side" style="margin-top: 16px;">
                                    <ha-selector
                                        .hass=${this.hass}
                                        .selector=${{ icon: {} }}
                                        .value=${action.icon_on || ""}
                                        .label=${"Icon (On State)"}
                                        @value-changed=${(ev) => this._updateQuickAction(index, 'icon_on', ev.detail.value)}
                                    ></ha-selector>
                                    <ha-selector
                                        .hass=${this.hass}
                                        .selector=${{ icon: {} }}
                                        .value=${action.icon_off || ""}
                                        .label=${"Icon (Off State)"}
                                        @value-changed=${(ev) => this._updateQuickAction(index, 'icon_off', ev.detail.value)}
                                    ></ha-selector>
                                </div>
                                <div class="side-by-side" style="margin-top: 16px;">
                                    <ha-selector
                                        .hass=${this.hass}
                                        .selector=${{ select: { options: colorMapThemeOptions, custom_value: true } }}
                                        .value=${action.icon_color_on || ""}
                                        .label=${"Icon Color (On State)"}
                                        @value-changed=${(ev) => this._updateQuickAction(index, 'icon_color_on', ev.detail.value)}
                                    ></ha-selector>
                                    <ha-selector
                                        .hass=${this.hass}
                                        .selector=${{ select: { options: colorMapThemeOptions, custom_value: true } }}
                                        .value=${action.bg_color_on || ""}
                                        .label=${"Background Color (On State)"}
                                        @value-changed=${(ev) => this._updateQuickAction(index, 'bg_color_on', ev.detail.value)}
                                    ></ha-selector>
                                </div>
                                <div class="side-by-side" style="margin-top: 16px;">
                                    <ha-selector
                                        .hass=${this.hass}
                                        .selector=${{ select: { options: colorMapThemeOptions, custom_value: true } }}
                                        .value=${action.icon_color_off || ""}
                                        .label=${"Icon Color (Off State)"}
                                        @value-changed=${(ev) => this._updateQuickAction(index, 'icon_color_off', ev.detail.value)}
                                    ></ha-selector>
                                    <ha-selector
                                        .hass=${this.hass}
                                        .selector=${{ select: { options: colorMapThemeOptions, custom_value: true } }}
                                        .value=${action.bg_color_off || ""}
                                        .label=${"Background Color (Off State)"}
                                        @value-changed=${(ev) => this._updateQuickAction(index, 'bg_color_off', ev.detail.value)}
                                    ></ha-selector>
                                </div>
                            `}

                            <ha-selector
                                .hass=${this.hass}
                                .selector=${{ text: {} }}
                                .value=${action.name || ""}
                                .label=${"Tooltip / Name (Optional)"}
                                @value-changed=${(ev) => this._updateQuickAction(index, 'name', ev.detail.value)}
                                style="margin-top: 16px;"
                            ></ha-selector>
                            <ha-selector
                                .hass=${this.hass}
                                .selector=${{ ui_action: {} }}
                                .value=${action.tap_action || { action: "none" }}
                                .label=${"Tap Action"}
                                @value-changed=${(ev) => this._updateQuickAction(index, 'tap_action', ev.detail.value)}
                                style="margin-top: 16px;"
                            ></ha-selector>
                            <ha-selector
                                .hass=${this.hass}
                                .selector=${{ ui_action: {} }}
                                .value=${action.hold_action || { action: "none" }}
                                .label=${"Hold Action"}
                                @value-changed=${(ev) => this._updateQuickAction(index, 'hold_action', ev.detail.value)}
                                style="margin-top: 16px;"
                            ></ha-selector>

                            <!-- NEW VISIBILITY SETTINGS -->
                            <ha-selector
                                .hass=${this.hass}
                                .selector=${{ select: { multiple: true, custom_value: true, options: this._users || [] } }}
                                .value=${action.visible_users || []}
                                .label=${"Visible to Users (Select users or type User ID)"}
                                @value-changed=${(ev) => this._updateQuickAction(index, 'visible_users', ev.detail.value)}
                                style="margin-top: 16px;"
                            ></ha-selector>
                        </div>
                    </div>
                `;
                })}
            </div>
        </div>

        <!-- 7. ALERTS & CONDITIONAL NOTIFICATIONS -->
        ${renderSectionHeader('alerts', 'Alerts & Conditional Notifications', html`<ha-button @click=${(ev) => { ev.stopPropagation(); this._addAlert(ev); }}>Add Alert</ha-button>`)}
        <div style="display: ${this._expandedSections.alerts ? 'block' : 'none'};">
            <p><i>Display notification icons and override secondary rings when a specific entity matches a state.</i></p>
            <div class="list-editor">
                ${(this.config.alerts || []).map((alert, index) => {
                const isExpanded = (this._expandedAlerts || {})[index];
                const headerTitle = alert.entity || 'Alert ' + (index + 1);

                return html`
                    <div class="list-item">
                        <div class="item-header" @click=${(ev) => this._toggleAlert(index, ev)} style="cursor: pointer; margin-bottom: ${isExpanded ? '12px' : '0'};">
                            <div style="display: flex; align-items: center; gap: 4px; overflow: hidden;">
                                <svg viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: currentColor; flex-shrink: 0;">
                                    <path d="${isExpanded ? 'M7.41,8.59L12,13.17L16.59,8.59L18,10L12,16L6,10L7.41,8.59Z' : 'M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z'}"></path>
                                </svg>
                                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.95em;">${headerTitle}</span>
                            </div>
                            <div class="item-actions" @click=${(ev) => ev.stopPropagation()}>
                                <ha-icon icon="mdi:delete" @click=${(ev) => this._removeAlert(index, ev)} style="cursor: pointer; padding: 8px;"></ha-icon>
                            </div>
                        </div>
                        ${isExpanded ? html`
                        <div class="item-content">
                            <ha-selector
                                .hass=${this.hass}
                                .selector=${{ entity: {} }}
                                .value=${alert.entity || ""}
                                .label=${"Condition Entity"}
                                @value-changed=${(ev) => this._updateAlert(index, 'entity', ev.detail.value)}
                            ></ha-selector>
                            <div class="side-by-side" style="margin-top: 16px;">
                                <ha-selector
                                    .hass=${this.hass}
                                    .selector=${{ text: {} }}
                                    .value=${alert.state || ""}
                                    .label=${"When state equals"}
                                    @value-changed=${(ev) => this._updateAlert(index, 'state', ev.detail.value)}
                                ></ha-selector>
                                <ha-selector
                                    .hass=${this.hass}
                                    .selector=${{ icon: {} }}
                                    .value=${alert.icon || ""}
                                    .label=${"Alert Icon"}
                                    @value-changed=${(ev) => this._updateAlert(index, 'icon', ev.detail.value)}
                                ></ha-selector>
                            </div>
                            <ha-selector
                                .hass=${this.hass}
                                .selector=${{ select: { options: colorMapThemeOptions, custom_value: true } }}
                                .value=${alert.color || ""}
                                .label=${"Alert Color (e.g. var(--warning-color) or red)"}
                                @value-changed=${(ev) => this._updateAlert(index, 'color', ev.detail.value)}
                                style="margin-top: 16px;"
                            ></ha-selector>
                            <ha-selector
                                .hass=${this.hass}
                                .selector=${{ ui_action: {} }}
                                .value=${alert.tap_action || { action: "more-info" }}
                                .label=${"Tap Action"}
                                @value-changed=${(ev) => this._updateAlert(index, 'tap_action', ev.detail.value)}
                                style="margin-top: 16px;"
                            ></ha-selector>
                        </div>
                        ` : ''}
                    </div>
                `;
                })}
            </div>
            
            <p><i>Note: For 'alerts', please switch to the Code editor to configure the YAML array, as they involve complex logic operations.</i></p>
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      ha-selector {
        display: block;
        margin-bottom: 16px;
      }
      ha-formfield {
        display: block;
        margin-bottom: 8px;
      }
      h3 {
        margin-top: 24px;
        margin-bottom: 8px;
      }
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 24px;
        margin-bottom: 8px;
        border-bottom: 1px solid var(--divider-color);
        padding-bottom: 8px;
      }
      .section-header h3 {
        margin: 0;
      }
      .list-editor {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .list-item {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 16px;
        padding-bottom: 16px;
        background: var(--secondary-background-color);
      }
      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
        margin-bottom: 12px;
      }
      .item-actions {
        display: flex;
        gap: 0px;
      }
      .side-by-side {
        display: flex;
        gap: 16px;
      }
      .side-by-side > * {
        flex: 1;
      }
      p {
        color: var(--secondary-text-color);
        font-size: 0.9em;
      }
    `;
  }
}
if (!customElements.get("status-summary-card-editor")) {
  customElements.define("status-summary-card-editor", StatusSummaryCardEditor);
}
if (!customElements.get("passable-status-summary-card-editor")) {
  class PassableStatusSummaryCardEditor extends StatusSummaryCardEditor {}
  customElements.define("passable-status-summary-card-editor", PassableStatusSummaryCardEditor);
}

// --- MAIN CARD ---
class StatusSummaryCard extends LitElement {
  static get properties() {
    return {
      hass: {},
      config: {},
      _history: { type: Array }
    };
  }

  constructor() {
    super();
    this._history = [];
    this._fetchTimer = null;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.config?.primary_info?.show_history) {
      this._fetchHistory();
      this._fetchTimer = setInterval(() => this._fetchHistory(), 300000); // 5 min
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._fetchTimer) {
      clearInterval(this._fetchTimer);
      this._fetchTimer = null;
    }
  }

  updated(changedProps) {
    super.updated(changedProps);
    if (changedProps.has("config")) {
      const oldConfig = changedProps.get("config");
      const newConfig = this.config;
      
      const shouldFetch = newConfig?.primary_info?.show_history && (
        !oldConfig || 
        oldConfig.primary_info?.entity !== newConfig.primary_info?.entity || 
        oldConfig.primary_info?.history_hours !== newConfig.primary_info?.history_hours
      );

      if (shouldFetch) {
        this._fetchHistory();
      }
      
      if (!newConfig?.primary_info?.show_history && this._fetchTimer) {
        clearInterval(this._fetchTimer);
        this._fetchTimer = null;
        this._history = [];
      } else if (newConfig?.primary_info?.show_history && !this._fetchTimer) {
        this._fetchTimer = setInterval(() => this._fetchHistory(), 300000);
      }
    }
  }

  async _fetchHistory() {
    if (!this.hass || !this.config?.primary_info?.entity) return;
    const entityId = this.config.primary_info.entity;
    const hours = this.config.primary_info.history_hours ?? 12;
    
    const now = new Date();
    const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
    const endTime = now.toISOString();

    try {
      const history = await this.hass.callApi(
        "GET",
        `history/period/${startTime}?filter_entity_id=${entityId}&end_time=${endTime}&minimal_response`
      );

      if (history && history.length > 0 && history[0].length > 0) {
        const attr = this.config.primary_info?.attribute;
        const isLightBrightness = attr === 'brightness' && entityId.startsWith('light.');

        const points = history[0]
          .filter(s => s.state !== "unavailable" && s.state !== "unknown")
          .map(s => {
              let valStr;
              if (attr) {
                  if (attr === 'brightness' && s.state === 'off') {
                      valStr = 0;
                  } else {
                      valStr = s.attributes ? s.attributes[attr] : undefined;
                  }
              } else {
                  valStr = s.state;
              }
              
              if (valStr === undefined || valStr === null) return NaN;

              if (isLightBrightness) {
                  return Math.round((parseFloat(valStr) / 255) * 100);
              }

              const stateStr = valStr.toString().toLowerCase();
              if (["on", "home", "true", "playing", "active"].includes(stateStr)) return 1;
              if (["off", "not_home", "false", "idle", "paused", "standby"].includes(stateStr)) return 0;
              return parseFloat(valStr);
          })
          .filter(n => !isNaN(n));
          
        const windowSize = Math.min(20, Math.max(3, Math.floor(points.length / 20)));
        const smoothedPoints = [];
        
        for (let i = 0; i < points.length; i++) {
            const start = Math.max(0, i - windowSize + 1);
            const slice = points.slice(start, i + 1);
            const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
            smoothedPoints.push(avg);
        }

        // Add a duplicate point if there's only 1 point, to draw a flat line
        if (smoothedPoints.length === 1) {
            smoothedPoints.push(smoothedPoints[0]);
        }

        this._history = smoothedPoints;
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  }

  static getConfigElement() {
    return document.createElement("passable-status-summary-card-editor");
  }

  static getStubConfig() {
    return {
      title: "Summary Status",
      primary_info: {
        entity: ""
      }
    };
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this.config = config;
  }

  getCardSize() {
    return 2;
  }

  _evaluateAlert(alert) {
    if (!alert || !alert.entity || !this.hass.states[alert.entity]) return false;
    const stateObj = this.hass.states[alert.entity];
    const stateVal = stateObj.state;
    
    if (alert.state !== undefined) {
      return stateVal === alert.state;
    }
    
    if (alert.operator && alert.value !== undefined) {
      const numericState = parseFloat(stateVal);
      const numericValue = parseFloat(alert.value);
      if (isNaN(numericState) || isNaN(numericValue)) return false;
      
      switch (alert.operator) {
        case ">": return numericState > numericValue;
        case "<": return numericState < numericValue;
        case ">=": return numericState >= numericValue;
        case "<=": return numericState <= numericValue;
        case "==": return numericState == numericValue;
        case "!=": return numericState != numericValue;
      }
    }
    return false;
  }

  _handleAction(ev) {
    const actionConfig = this.config.tap_action || { action: "more-info" };
    this._executeActionConfig(actionConfig);
  }

  _executeActionConfig(actionConfig) {
    if (!actionConfig) return;
    const entityId = this.config.primary_info?.entity;

    if (actionConfig.action === "fire-dom-event") {
      const event = new Event("ll-custom", { bubbles: true, composed: true, cancelable: false });
      event.detail = actionConfig;
      this.dispatchEvent(event);
    } else if (actionConfig.action === "call-service") {
      const [domain, service] = actionConfig.service.split(".");
      this.hass.callService(domain, service, actionConfig.data || {});
    } else if (actionConfig.action === "navigate") {
      window.history.pushState(null, "", actionConfig.navigation_path);
      const event = new Event("location-changed", { bubbles: true, composed: true });
      window.dispatchEvent(event);
    } else if (actionConfig.action === "url") {
      window.open(actionConfig.url_path, "_blank");
    } else if (actionConfig.action === "more-info") {
      const targetEntity = actionConfig.entity || entityId;
      if (targetEntity) {
        const event = new Event("hass-more-info", { bubbles: true, composed: true });
        event.detail = { entityId: targetEntity };
        this.dispatchEvent(event);
      }
    }
  }

  _handleQuickActionStart(ev) {
    ev.stopPropagation();
    this._quickActionTimer = Date.now();
  }

  _handleQuickActionEnd(ev, action) {
    ev.stopPropagation();
    if (!this._quickActionTimer) return;
    const duration = Date.now() - this._quickActionTimer;
    this._quickActionTimer = null;
    
    if (duration > 400) {
      if (action.hold_action && action.hold_action.action !== "none") {
        this._executeActionConfig(action.hold_action);
      }
    } else {
      if (action.tap_action && action.tap_action.action !== "none") {
        this._executeActionConfig(action.tap_action);
      }
    }
  }

  _handleEntityClick(ev, entityId) {
    if (!entityId) return;
    ev.stopPropagation();
    const event = new Event('hass-more-info', { bubbles: true, composed: true });
    event.detail = { entityId: entityId };
    this.dispatchEvent(event);
  }

  _handleAlertClick(ev, alert) {
    ev.stopPropagation();
    if (alert.tap_action && alert.tap_action.action && alert.tap_action.action !== 'more-info' && alert.tap_action.action !== 'none') {
        const event = new Event('hass-action', { bubbles: true, composed: true });
        event.detail = {
            config: { tap_action: alert.tap_action },
            action: 'tap'
        };
        this.dispatchEvent(event);
    } else {
        this._handleEntityClick(ev, alert.entity);
    }
  }

  _formatRelativeTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }

  _renderExtraInfo(stateObj, extraInfoArray) {
    if (!stateObj || !extraInfoArray || !Array.isArray(extraInfoArray) || extraInfoArray.length === 0) return '';
    
    const parts = extraInfoArray.map(infoType => {
        if (infoType === 'last_changed') return this._formatRelativeTime(stateObj.last_changed);
        if (infoType === 'last_updated') return this._formatRelativeTime(stateObj.last_updated);
        if (stateObj.attributes && stateObj.attributes[infoType] !== undefined) return stateObj.attributes[infoType];
        return '';
    }).filter(p => p !== '');
    
    if (parts.length === 0) return '';
    return html`<div class="extra-info-sublabel">${parts.join(' • ')}</div>`;
  }
  
  _renderSparkline(historyData, color) {
    if (!historyData || historyData.length < 2) return html``;
    const min = Math.min(...historyData);
    const max = Math.max(...historyData);
    const range = max - min;
    const width = 100;
    const height = 100;
    const step = width / (historyData.length - 1);

    const getY = (val) => {
        if (range === 0) {
            return val > 0 ? 10 : height - 10; // offset slightly from top/bottom
        }
        return height - ((val - min) / range) * height;
    };

    let d = `M 0 ${getY(historyData[0])}`;
    for (let i = 1; i < historyData.length; i++) {
      const x = i * step;
      const y = getY(historyData[i]);
      d += ` L ${x} ${y}`;
    }
    
    const areaPath = `${d} L 100 100 L 0 100 Z`;
    const gradId = "grad-" + Math.random().toString(36).substr(2, 9);

    return html`
      <svg class="sparkline-bg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="${gradId}" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="${color}" stop-opacity="0.15" />
            <stop offset="100%" stop-color="${color}" stop-opacity="0.0" />
          </linearGradient>
        </defs>
        <path d="${areaPath}" fill="url(#${gradId})"></path>
        <path d="${d}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" style="opacity: 0.5"></path>
      </svg>
    `;
  }

  render() {
    if (!this.config || !this.hass) return html``;

    const layoutStyle = this.config.secondary_layout || 'list';

    // Primary Info
    let primaryState = "N/A";
    let primaryUnit = "";
    let primaryName = this.config.primary_info?.name || "";
    let primaryStateObj = null;

    if (this.config.primary_info && this.config.primary_info.entity) {
      primaryStateObj = this.hass.states[this.config.primary_info.entity];
      if (primaryStateObj) {
        if (this.config.primary_info.attribute) {
            const attr = this.config.primary_info.attribute;
            primaryState = primaryStateObj.attributes[attr];
            if (primaryState == null) {
                if (attr === 'brightness' && primaryStateObj.state === 'off') {
                    primaryState = 0;
                } else if (attr === 'brightness' && primaryStateObj.state === 'on') {
                    primaryState = 255;
                } else {
                    primaryState = "N/A";
                }
            } 
            if (attr === 'brightness' && primaryStateObj.entity_id.startsWith('light.') && primaryState !== "N/A") {
                primaryState = Math.round((parseFloat(primaryState) / 255) * 100);
                if (!this.config.primary_info.unit) primaryUnit = "%";
            }
        } else {
            primaryState = primaryStateObj.state;
            primaryUnit = this.config.primary_info.unit || primaryStateObj.attributes.unit_of_measurement || "";
        }
        if (!primaryName) primaryName = primaryStateObj.attributes.friendly_name || this.config.primary_info.entity;
      }
    }

    // Evaluate all alerts
    const activeAlerts = (this.config.alerts || []).filter(alert => this._evaluateAlert(alert));
    
    // Determine dynamic color based on active alerts matching the primary entity
    let primaryColor = 'var(--info-color, var(--primary-color))';
    if (primaryStateObj && primaryStateObj.entity_id.startsWith('light.')) {
        if (primaryStateObj.state === 'on') {
            if (primaryStateObj.attributes.rgb_color) {
                const [r, g, b] = primaryStateObj.attributes.rgb_color;
                primaryColor = `rgb(${r}, ${g}, ${b})`;
            } else {
                primaryColor = 'var(--state-light-active-color, var(--state-active-color, #ffc107))';
            }
        } else {
            primaryColor = 'var(--primary-text-color)';
        }
    }

    if (this.config.primary_info?.entity) {
      const primaryAlert = activeAlerts.find(a => a.entity === this.config.primary_info.entity);
      if (primaryAlert && primaryAlert.color) {
        primaryColor = primaryAlert.color;
      }
    }
    
    // Palette for non-light secondary items (skips info-color to contrast with primary)
    const colorPalette = [
        'var(--success-color, #4caf50)',
        'var(--warning-color, #ff9800)',
        'var(--error-color, #f44336)',
        '#9c27b0', // Purple
        '#00bcd4', // Cyan
        '#e91e63', // Pink
        '#3f51b5'  // Indigo
    ];
    let paletteIndex = 0;

    // Gauge calculation
    const showGauge = this.config.primary_info?.show_gauge;
    let gaugePct = 0;
    if (showGauge) {
        if (!isNaN(parseFloat(primaryState))) {
            const val = parseFloat(primaryState);
            const min = this.config.primary_info.gauge_min ?? 0;
            const max = this.config.primary_info.gauge_max ?? 100;
            gaugePct = Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
        } else if (['on', 'home', 'active', 'playing', 'open', 'unlocked'].includes(String(primaryState).toLowerCase())) {
            gaugePct = 100;
        }
    }

    // Dynamic Card Background Color
    let cardBackground = null;
    let cardIntensity = 0.2;
    if (primaryStateObj && this.config.color_map) {
        const matchingMap = this.config.color_map.find(c => c.state.toString().toLowerCase() === primaryStateObj.state.toString().toLowerCase());
        if (matchingMap && matchingMap.color) {
            cardBackground = matchingMap.color;
            cardIntensity = (matchingMap.intensity ?? 20) / 100;
        }
    }

    const cardBgStyle = this.config.background_image 
        ? `background-image: url('${this.config.background_image}'); background-size: cover; background-position: center;`
        : '';

    return html`
      <ha-card @click="${this._handleAction}" tabindex="0" style="${cardBgStyle}">
        ${cardBackground ? html`<div class="card-background-overlay" style="background: ${cardBackground}; opacity: ${cardIntensity};"></div>` : ''}
        ${this.config.primary_info?.show_history && this._history.length > 1 
          ? html`<div class="sparkline-container">${this._renderSparkline(this._history, primaryColor)}</div>` 
          : ''}
          
        <div class="card-content">
          <div class="top-row">
            <div class="header">
              ${this.config.image
                  ? html`<img class="main-image" src="${this.config.image}" alt="${primaryName}" />`
                  : (this.config.icon 
                      ? html`<ha-icon class="main-icon" icon="${this.config.icon}"></ha-icon>` 
                      : (primaryStateObj ? html`<ha-state-icon class="main-icon" .hass=${this.hass} .stateObj=${primaryStateObj}></ha-state-icon>` : '')
                  )
              }
              <div class="title-container" style="display: flex; flex-direction: column; justify-content: center; gap: 4px;">
                <div class="title">${this.config.title || 'Summary'}</div>
                ${this.config.quick_actions && this.config.quick_actions.length > 0 ? html`
                  <div class="quick-actions-row">
                    ${this.config.quick_actions.map(action => {
                      if (action.visible_users && action.visible_users.length > 0) {
                          if (!this.hass.user || !action.visible_users.includes(this.hass.user.id)) {
                              return '';
                          }
                      }

                      let actionIcon = action.icon || '';
                      let bgStyle = '';
                      let iconStyle = '';
                      
                      if (action.entity && this.hass.states[action.entity]) {
                          const stateObj = this.hass.states[action.entity];
                          const isOn = ['on', 'home', 'active', 'playing', 'open', 'unlocked', 'true'].includes(String(stateObj.state).toLowerCase());
                          
                          if (isOn) {
                              if (action.icon_on) actionIcon = action.icon_on;
                              if (action.bg_color_on) bgStyle = `background-color: ${action.bg_color_on};`;
                              if (action.icon_color_on) iconStyle = `color: ${action.icon_color_on};`;
                          } else {
                              if (action.icon_off) actionIcon = action.icon_off;
                              if (action.bg_color_off) bgStyle = `background-color: ${action.bg_color_off};`;
                              if (action.icon_color_off) iconStyle = `color: ${action.icon_color_off};`;
                          }
                      }
                      
                      return html`
                        <div class="quick-action-btn" 
                             @mousedown=${this._handleQuickActionStart}
                             @mouseup=${(ev) => this._handleQuickActionEnd(ev, action)}
                             @touchstart=${this._handleQuickActionStart}
                             @touchend=${(ev) => this._handleQuickActionEnd(ev, action)}
                             @click=${(ev) => ev.stopPropagation()}
                             title="${action.name || ''}"
                             style="${bgStyle}">
                          ${actionIcon ? html`<ha-icon icon="${actionIcon}" style="${iconStyle}"></ha-icon>` : ''}
                        </div>
                      `;
                    })}
                  </div>
                ` : ''}
              </div>
            </div>
            
            <div class="primary-info">
              <div class="alerts-container">
                ${this.config.status_icons ? this.config.status_icons.map(iconObj => {
                  const isString = typeof iconObj === 'string';
                  const entityId = isString ? iconObj : iconObj.entity;
                  if (!entityId) return '';
                  
                  const stateObj = this.hass.states[entityId];
                  if (!stateObj) return '';
                  
                  const isActive = ['home', 'on', 'active', 'playing', 'open', 'unlocked', 'true'].includes(String(stateObj.state).toLowerCase());

                  if (this.config.status_icons_active_only && !isActive) return '';
                  
                  let customIcon = '';
                  let iconColor = '';
                  let bgColor = '';

                  if (!isString) {
                      if (isActive) {
                          if (iconObj.icon_on) customIcon = iconObj.icon_on;
                          if (iconObj.icon_color_on) iconColor = iconObj.icon_color_on;
                          if (iconObj.bg_color_on) bgColor = iconObj.bg_color_on;
                      } else {
                          if (iconObj.icon_off) customIcon = iconObj.icon_off;
                          if (iconObj.icon_color_off) iconColor = iconObj.icon_color_off;
                          if (iconObj.bg_color_off) bgColor = iconObj.bg_color_off;
                      }
                  }
                  
                  const styleStr = (iconColor ? `color: ${iconColor}; ` : '') + (bgColor ? `background-color: ${bgColor}; padding: 4px; border-radius: 50%; ` : '');
                  
                  return html`
                    <div class="status-icon-indicator clickable-item" title="${stateObj.attributes.friendly_name || entityId}: ${stateObj.state}" @click=${(ev) => this._handleEntityClick(ev, entityId)}>
                      ${customIcon 
                        ? html`<ha-icon icon="${customIcon}" style="${styleStr}"></ha-icon>`
                        : (stateObj.attributes.entity_picture
                            ? html`<img src="${stateObj.attributes.entity_picture}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; ${styleStr}" />`
                            : html`<ha-state-icon .hass=${this.hass} .stateObj=${stateObj} style="${styleStr}"></ha-state-icon>`
                          )
                      }
                    </div>
                  `;
                }) : ''}
                
                ${activeAlerts.map(alert => html`
                  <div class="alert-indicator clickable-item" style="background-color: ${alert.color || 'var(--error-color)'};" title="${alert.entity}" @click=${(ev) => this._handleAlertClick(ev, alert)}>
                    <ha-icon icon="${alert.icon || 'mdi:alert'}"></ha-icon>
                  </div>
                `)}
              </div>

              ${showGauge ? html`
                <div class="progress-container clickable-item" @click=${(ev) => this._handleEntityClick(ev, this.config.primary_info?.entity)}>
                  <div class="progress-labels">
                    ${!this.config.primary_info?.hide_name ? html`<span class="primary-name">${primaryName}</span>` : ''}
                    <span class="primary-value-small">${primaryState}${primaryUnit}</span>
                  </div>
                  <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${gaugePct}%; background: ${primaryColor};"></div>
                  </div>
                </div>
              ` : html`
                <div class="clickable-item" style="display: flex; flex-direction: column; align-items: flex-end;" @click=${(ev) => this._handleEntityClick(ev, this.config.primary_info?.entity)}>
                  <div class="primary-value">${primaryState}<span class="primary-unit">${primaryUnit}</span></div>
                  ${!this.config.primary_info?.hide_name ? html`<div class="primary-name">${primaryName}</div>` : ''}
                  ${this._renderExtraInfo(primaryStateObj, this.config.primary_info?.extra_info)}
                </div>
              `}
            </div>
          </div>
          
          ${this.config.secondary_info && this.config.secondary_info.length > 0 ? html`
            <div class="secondary-row ${layoutStyle === 'grid' ? 'secondary-grid' : (layoutStyle === 'rings' ? 'secondary-rings' : '')}">
              ${this.config.secondary_info.map(info => {
                const stateObj = this.hass.states[info.entity];
                let stateVal = "N/A";
                let unitVal = info.unit || "";
                
                if (stateObj) {
                    if (info.attribute && info.attribute !== 'state') {
                        stateVal = stateObj.attributes[info.attribute];
                        if (stateVal == null) {
                            if (info.attribute === 'brightness' && stateObj.state === 'off') {
                                stateVal = 0;
                            } else if (info.attribute === 'brightness' && stateObj.state === 'on') {
                                stateVal = 255;
                            } else {
                                stateVal = "N/A";
                            }
                        } 
                        if (info.attribute === 'brightness' && stateObj.entity_id.startsWith('light.') && stateVal !== "N/A") {
                            // Home Assistant natively stores brightness as 0-255. Convert to 0-100%.
                            stateVal = Math.round((parseFloat(stateVal) / 255) * 100);
                            if (!info.unit) unitVal = "%";
                        }
                    } else {
                        stateVal = stateObj.state;
                        if (!info.unit) unitVal = stateObj.attributes.unit_of_measurement || "";
                    }
                }
                
                const displayLabel = info.name || (stateObj ? stateObj.attributes.friendly_name : info.entity);
                
                let itemColor = 'var(--primary-text-color)';
                
                if (stateObj && info.entity.startsWith('light.')) {
                    if (stateObj.state === 'on') {
                        if (stateObj.attributes.rgb_color) {
                            const [r, g, b] = stateObj.attributes.rgb_color;
                            itemColor = `rgb(${r}, ${g}, ${b})`;
                        } else {
                            itemColor = 'var(--state-light-active-color, var(--state-active-color, #ffc107))';
                        }
                    }
                } else if (stateObj) {
                    itemColor = colorPalette[paletteIndex % colorPalette.length];
                    paletteIndex++;
                }

                const itemAlert = activeAlerts.find(a => a.entity === info.entity);
                if (itemAlert && itemAlert.color) {
                    itemColor = itemAlert.color;
                }

                if (info.show_gauge) {
                    let sGaugePct = 0;
                    if (!isNaN(parseFloat(stateVal))) {
                        const val = parseFloat(stateVal);
                        const min = info.gauge_min ?? 0;
                        const max = info.gauge_max ?? 100;
                        sGaugePct = Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
                    } else if (['on', 'home', 'active', 'playing', 'open', 'unlocked'].includes(String(stateVal).toLowerCase())) {
                        sGaugePct = 100;
                    }
                    
                    if (layoutStyle === 'rings') {
                        const radius = 22;
                        const circumference = 2 * Math.PI * radius;
                        const dash = (sGaugePct / 100) * circumference;
                        const strokeColor = itemColor === 'var(--primary-text-color)' ? 'var(--info-color, var(--primary-color))' : itemColor;
                        
                        const totalStr = `${stateVal}${unitVal}`;
                        let fontSize = '0.9em';
                        if (totalStr.length > 6) fontSize = '0.55em';
                        else if (totalStr.length > 4) fontSize = '0.7em';

                        return html`
                            <div class="ring-wrapper clickable-item" @click=${(ev) => this._handleEntityClick(ev, info.entity)}>
                                <div class="ring-container" title="${displayLabel}">
                                    <svg viewBox="0 0 50 50" class="ring-svg">
                                        <circle class="ring-bg" cx="25" cy="25" r="${radius}"></circle>
                                        <circle class="ring-fill" cx="25" cy="25" r="${radius}" 
                                            stroke="${sGaugePct === 0 ? 'none' : strokeColor}" 
                                            stroke-dasharray="${dash} ${circumference}" 
                                            stroke-dashoffset="0"></circle>
                                    </svg>
                                    <div class="ring-value-container">
                                        <span class="ring-value" style="font-size: ${fontSize};">${stateVal}${unitVal}</span>
                                    </div>
                                </div>
                                <div class="ring-label-wrapper">
                                  ${!info.hide_icon ? (info.icon 
                                      ? html`<ha-icon class="secondary-icon" icon="${info.icon}"></ha-icon>` 
                                      : (stateObj ? html`<ha-state-icon class="secondary-icon" .hass=${this.hass} .stateObj=${stateObj}></ha-state-icon>` : ''))
                                      : ''
                                  }
                                  <div style="display: flex; flex-direction: column; align-items: center;">
                                    ${!info.hide_name ? html`<span class="ring-label">${displayLabel}</span>` : ''}
                                    ${this._renderExtraInfo(stateObj, info.extra_info)}
                                  </div>
                                </div>
                            </div>
                        `;
                    }

                    // Default or Grid gauge rendering
                    return html`
                        <div class="secondary-item secondary-item-gauge clickable-item" style="flex: 1 1 100%;" @click=${(ev) => this._handleEntityClick(ev, info.entity)}>
                            <div class="progress-container" style="max-width: 100%;">
                                <div class="progress-labels">
                                    <div style="display: flex; flex-direction: column;">
                                        <span class="secondary-name" style="display: flex; align-items: center; gap: 6px;">
                                            ${!info.hide_icon ? (info.icon ? html`<ha-icon class="secondary-icon" icon="${info.icon}"></ha-icon>` : (stateObj ? html`<ha-state-icon class="secondary-icon" .hass=${this.hass} .stateObj=${stateObj}></ha-state-icon>` : '')) : ''}
                                            ${!info.hide_name ? displayLabel : ''}
                                        </span>
                                        ${this._renderExtraInfo(stateObj, info.extra_info)}
                                    </div>
                                    <span class="secondary-value">${stateVal}${unitVal}</span>
                                </div>
                                <div class="progress-bar-bg">
                                    <div class="progress-bar-fill" style="width: ${sGaugePct}%; background: ${itemColor === 'var(--primary-text-color)' ? 'var(--info-color, var(--primary-color))' : itemColor};"></div>
                                </div>
                            </div>
                        </div>
                    `;
                }

                return html`
                  <div class="secondary-item clickable-item" @click=${(ev) => this._handleEntityClick(ev, info.entity)}>
                    ${!info.hide_icon ? (info.icon 
                        ? html`<ha-icon class="secondary-icon" icon="${info.icon}" style="color: ${itemColor === 'var(--primary-text-color)' ? 'var(--state-icon-color)' : itemColor}"></ha-icon>` 
                        : (stateObj ? html`<ha-state-icon class="secondary-icon" .hass=${this.hass} .stateObj=${stateObj} style="color: ${itemColor === 'var(--primary-text-color)' ? 'var(--state-icon-color)' : itemColor}"></ha-state-icon>` : ''))
                        : ''
                    }
                    <div style="display: flex; flex-direction: column; flex: 1;">
                      ${!info.hide_name ? html`<span class="secondary-name">${displayLabel}:</span>` : ''}
                      ${this._renderExtraInfo(stateObj, info.extra_info)}
                    </div>
                    <span class="secondary-value" style="color: ${itemColor === 'var(--primary-text-color)' ? 'inherit' : itemColor}">${stateVal}${unitVal}</span>
                  </div>
                `;
              })}
            </div>
          ` : ''}
        </div>
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      ha-card {
        cursor: pointer;
        overflow: hidden;
        transition: transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        position: relative;
        background: var(--ha-card-background, var(--card-background-color, white));
      }
      ha-card:hover {
        transform: scale(1.02);
        box-shadow: 0 8px 16px rgba(0,0,0,0.2);
      }
      .card-background-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 0;
        transition: background 0.3s ease, opacity 0.3s ease;
      }
      .clickable-item {
        cursor: pointer;
        transition: opacity 0.2s ease;
      }
      .clickable-item:hover {
        opacity: 0.75;
      }
      .sparkline-container {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 0;
        opacity: 0.35;
        pointer-events: none;
      }
      .sparkline-bg {
        width: 100%;
        height: 100%;
      }
      .card-content {
        padding: 16px;
        position: relative;
        z-index: 1;
      }
      .top-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .header {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
      }
      .main-icon {
        color: var(--state-icon-color, var(--primary-text-color));
        width: 32px;
        height: 32px;
      }
      .main-image {
        max-height: 48px;
        max-width: 120px;
        object-fit: contain;
        border-radius: 4px;
      }
      .title {
        font-size: 1.1em;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .quick-actions-row {
        display: flex;
        flex-direction: row;
        gap: 8px;
        margin-top: 2px;
      }
      .quick-action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: var(--secondary-background-color, rgba(120, 120, 120, 0.2));
        color: var(--primary-text-color);
        cursor: pointer;
        transition: background-color 0.2s, opacity 0.2s;
      }
      .quick-action-btn:hover {
        background-color: var(--primary-color, rgba(120, 120, 120, 0.4));
        opacity: 0.9;
      }
      .quick-action-btn ha-icon {
        --mdc-icon-size: 18px;
      }
      .primary-info {
        text-align: right;
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: flex-start;
      }
      .primary-value {
        font-size: 2em;
        font-weight: 600;
        line-height: 1;
        color: var(--primary-text-color);
      }
      .primary-value-small {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--primary-text-color);
      }
      .primary-unit {
        font-size: 0.5em;
        margin-left: 2px;
        font-weight: normal;
        color: var(--secondary-text-color);
      }
      .primary-name {
        font-size: 0.8em;
        color: var(--secondary-text-color);
        margin-top: 4px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .progress-container {
        width: 100%;
        max-width: 160px;
        margin-top: 4px;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }
      .progress-labels {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        width: 100%;
        margin-bottom: 6px;
      }
      .progress-labels .primary-name, .progress-labels .secondary-name {
        margin-top: 0;
        text-align: left;
      }
      .progress-bar-bg {
        width: 100%;
        height: 8px;
        background: var(--secondary-background-color, rgba(120, 120, 120, 0.2));
        border-radius: 4px;
        overflow: hidden;
      }
      .progress-bar-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 0.3s ease, background-color 0.3s ease;
      }

      .secondary-row {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 8px;
      }
      .secondary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 16px 12px;
      }
      .secondary-grid .secondary-item-gauge {
        flex: none;
      }
      .secondary-rings {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        margin-top: 16px;
        justify-content: center;
      }

      .secondary-item {
        font-size: 0.9em;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .secondary-item-gauge {
        margin-top: 4px;
      }
      .secondary-icon {
        width: 18px;
        height: 18px;
        --mdc-icon-size: 18px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--state-icon-color, var(--secondary-text-color));
      }
      .secondary-name {
        color: var(--secondary-text-color);
      }
      .secondary-value {
        font-weight: 500;
        font-size: 1.1em;
        color: var(--primary-text-color);
      }
      .extra-info-sublabel {
        font-size: 0.75em;
        color: var(--secondary-text-color);
        opacity: 0.8;
        margin-top: 2px;
      }
      
      .ring-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }
      .ring-container {
        position: relative;
        width: 50px;
        height: 50px;
      }
      .ring-svg {
        transform: rotate(-90deg);
        width: 100%;
        height: 100%;
      }
      .ring-bg {
        fill: none;
        stroke: var(--secondary-background-color, rgba(120, 120, 120, 0.2));
        stroke-width: 4;
      }
      .ring-fill {
        fill: none;
        stroke-width: 4;
        stroke-linecap: round;
        transition: stroke-dashoffset 0.5s ease;
      }
      .ring-value-container {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .ring-value {
        font-weight: 600;
        color: var(--primary-text-color);
        text-align: center;
        line-height: 1;
      }
      .ring-label-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        width: 100%;
      }
      .ring-label {
        font-size: 0.75em;
        color: var(--secondary-text-color);
        text-align: left;
        max-width: 60px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .alerts-container {
        display: flex;
        gap: 6px;
        align-items: center;
        justify-content: flex-end;
        margin-bottom: 6px;
      }
      .status-icon-indicator {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 24px;
        height: 24px;
        color: var(--state-icon-color);
      }
      .status-icon-indicator ha-state-icon {
        width: 20px;
        height: 20px;
      }
      .alert-indicator {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        color: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        margin-left: 4px;
      }
      .alert-indicator ha-icon {
        width: 16px;
        height: 16px;
      }
    `;
  }
}

if (!customElements.get("passable-status-summary-card")) {
  customElements.define("passable-status-summary-card", StatusSummaryCard);
}
if (!customElements.get("status-summary-card")) {
  class LegacyStatusSummaryCard extends StatusSummaryCard {}
  customElements.define("status-summary-card", LegacyStatusSummaryCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "passable-status-summary-card",
  name: "Passable Status Summary Card",
  preview: true,
  description: "It summarizes entity status and alerts. Don't expect a miracle.",
});

# Passable Status Summary Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/default)
[![version](https://img.shields.io/badge/version-v1.0.1-blue.svg)](https://github.com/GBear09/passable-status-summary-card/releases)
[![license](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A flexible, high-performance universal status summary card for Home Assistant Lovelace dashboards. Designed for displaying comprehensive overview information for complex entities such as vehicles, system nodes, smart appliances, network hardware, and environmental sensors.

---

## ✨ Features

- **Full Visual GUI Editor**: Easily configure every detail directly from the Lovelace UI with drag-and-drop / collapsible configuration sections.
- **Dynamic Background Colors**: Change the card background color dynamically based on entity states (e.g., green when online/charging, red when error/problem) with adjustable intensity/opacity.
- **Background Image Support**: Apply full-card custom background images or vehicle renders.
- **Primary Information Section**: Display main entity state or specific attributes, optional custom titles, and secondary indicators like `last_changed` or `last_updated`.
- **Secondary Information List**: Add multiple entity attributes or supplementary entities with custom labels, order management, and optional **circular progress/gauge rings**.
- **Status Icons & Alerts**: Highlight critical states (e.g., low battery, check engine, offline alert) with customizable badge icons and colors.
- **Quick Action Buttons**: Fast interactive control buttons built into the card for triggering services or navigating.
- **User Restrictions & Access Controls**: Filter card visibility or controls based on Home Assistant user permissions.

---

## 📦 Installation

### Option 1: Via HACS (Recommended)

1. Open **HACS** in your Home Assistant instance.
2. Click the three dots `⋮` in the top-right corner and select **Custom repositories**.
3. Add the repository URL:
   ```text
   https://github.com/GBear09/passable-status-summary-card
   ```
4. Set the Category to **Dashboard** (or **Lovelace**) and click **Add**.
5. Find **Passable Status Summary Card** in HACS, click **Download**, and reload your browser dashboard.

---

### Option 2: Manual Installation

1. Download the [`passable-status-summary-card.js`](passable-status-summary-card.js) file from the latest release.
2. Upload `passable-status-summary-card.js` into your Home Assistant `/config/www/` directory.
3. In Home Assistant, navigate to **Settings** -> **Dashboards** -> **Three Dots (top right)** -> **Resources**.
4. Click **Add Resource** and set:
   - **Url**: `/local/passable-status-summary-card.js?v=1.0.1`
   - **Resource Type**: `JavaScript Module`
5. Refresh your browser page.

---

## 🚀 Usage Examples

### Basic Vehicle Summary Card

```yaml
type: custom:passable-status-summary-card
title: Model 3
icon: mdi:car-electric
primary_info:
  entity: sensor.tesla_battery_level
  name: Battery Level
  attribute: state
secondary_info:
  - entity: sensor.tesla_charging_state
    name: Charging State
  - entity: sensor.tesla_range
    name: Estimated Range
```

### Advanced Card with Dynamic Colors, Rings, Alerts & Quick Actions

```yaml
type: custom:passable-status-summary-card
title: Home Server Status
icon: mdi:server
background_image: /local/images/server_rack.jpg
color_map:
  - state: 'online'
    color: 'var(--success-color)'
    intensity: 25
  - state: 'error'
    color: 'var(--error-color)'
    intensity: 45
primary_info:
  entity: sensor.server_status
  name: Primary Node
  attribute: state
  extra_info: last_updated
secondary_info:
  - entity: sensor.cpu_usage
    name: CPU Load
    show_ring: true
    min_value: 0
    max_value: 100
  - entity: sensor.ram_usage
    name: Memory Usage
    show_ring: true
    min_value: 0
    max_value: 100
quick_actions:
  - icon: mdi:restart
    tap_action:
      action: call-service
      service: button.press
      target:
        entity_id: button.reboot_server
alerts:
  - entity: sensor.server_temperature
    state: 'high'
    icon: mdi:thermometer-alert
    color: '#e74c3c'
```

---

## ⚙️ Configuration Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `type` | string | **Required** | Must be `custom:passable-status-summary-card` (or `custom:status-summary-card`) |
| `title` | string | Optional | Custom title for the card |
| `icon` | string | Optional | Icon displayed in header (overrides state icon) |
| `image` | string | Optional | Image URL or path to override card icon |
| `background_image` | string | Optional | Path to background image (e.g. `/local/bg.jpg`) |
| `color_map` | list | Optional | Dynamic card background colors mapped to states |
| `primary_info` | object | Optional | Primary entity, attribute selection, and extra info |
| `secondary_info` | list | Optional | Array of secondary info items and optional progress rings |
| `quick_actions` | list | Optional | List of interactive quick action buttons |
| `alerts` | list | Optional | List of warning icons/indicators triggered by states |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

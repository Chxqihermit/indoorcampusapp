# CampusNav UI Redesign - Google Maps Style

## Overview

The CampusNav interface has been redesigned to match the Google Maps style layout for a more modern and intuitive user experience. This guide explains the new layout and changes.

---

## New Layout Structure

### Header Bar (Top)
- **Fixed Position**: Always visible at the top
- **Height**: 64px (h-16)
- **Components**:
  - **Hamburger Menu** (☰) - Toggle sidebar visibility
  - **Logo/Title** - "CampusNav" branding
  - **GPS Button** (📍) - Use current GPS location

### Sidebar (Left, Collapsible)
- **Width**: 256px (w-64)
- **Default**: Collapsed (hidden off-screen)
- **Toggle**: Click hamburger menu or click overlay
- **Contents**: Navigation menu (Dashboard, Indoor Map, etc.)
- **Animation**: Smooth slide-in/slide-out transition

### Map Container (Center)
- **Full Screen**: Takes up all remaining space
- **Top Margin**: 64px to account for header
- **Responsive**: Adjusts to sidebar visibility

### Map Controls
- **Position**: Bottom-left (moved from top-left)
- **Contains**: Start/Destination inputs, Set buttons, Find Route, Clear buttons
- **Z-Index**: Floats above the map

### Click Overlay
- **Triggered**: When sidebar is open
- **Purpose**: Close sidebar when clicking on map
- **Semi-transparent**: Black with 20% opacity

---

## Component Files

### 1. **MapHeader.tsx** (New)
Located: `resources/js/components/MapHeader.tsx`

Simple navigation header with:
- Hamburger menu button
- Logo text
- GPS location button

```typescript
<MapHeader
  onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
  onGpsClick={() => gpsBtn.click()}
/>
```

### 2. **Dashboard.tsx** (Updated)
Located: `resources/js/pages/Dashboard.tsx`

Main page that combines:
- MapHeader component
- Collapsible sidebar
- Full-screen map
- Click overlay for sidebar

### 3. **MapComponent.tsx** (Modified)
Located: `resources/js/components/MapComponent.tsx`

Changes:
- WalkControl moved to `bottom-left` (was `top-left`)
- GPS button marked with `data-gps-btn` attribute
- Can be triggered via keyboard shortcut "G"

---

## CSS Classes

New Tailwind CSS classes added to `resources/css/app.css`:

```css
.map-header              /* Fixed header container */
.map-container          /* Map content area */
.map-sidebar            /* Collapsible sidebar */
.map-sidebar.hidden     /* Hidden sidebar state */
.map-sidebar-overlay    /* Click overlay */
.map-menu-btn           /* Menu button styling */
.map-gps-btn            /* GPS button styling */
.maplibregl-ctrl-top-left
.maplibregl-ctrl-top-right
```

---

## User Interactions

### Opening the Map
1. User navigates to `/dashboard`
2. Header loads at top
3. Sidebar is hidden by default
4. Full-screen map is visible
5. Map controls are at bottom-left

### Using the Sidebar
1. Click hamburger menu (☰) in header
2. Sidebar slides in from left
3. Click overlay appears
4. Click overlay or menu items to navigate

### Setting Start/Destination
1. Map controls at bottom-left have input fields
2. Type location name or click on map
3. Click "Set" button to confirm
4. Start point = Green marker
5. Destination = Red marker

### Using GPS Location
1. **Method 1**: Click GPS button (📍) in header
2. **Method 2**: Press "G" key on keyboard
3. Location acquired with accuracy shown
4. Map auto-centers on your position
5. Start point is automatically set

### Finding Route
1. Set both start and destination
2. Click "Find Route" button
3. Blue line shows optimal walking path
4. Distance and duration displayed
5. Click "Clear" to reset

---

## Responsive Behavior

### Desktop (1024px+)
- Header spans full width
- Sidebar can be toggled
- Map uses remaining space
- Controls visible at bottom-left

### Tablet (640px - 1023px)
- Header adjusted for smaller screen
- Sidebar takes 100% width when open
- Map fullscreen when sidebar closed
- Touch-friendly buttons

### Mobile (< 640px)
- Header compact
- Hamburger menu essential
- Sidebar full-screen overlay
- Map controls accessible via scroll

---

## Dark Mode Support

All components support dark mode via Tailwind's `dark:` variant:
- Header: Dark slate background
- Sidebar: Dark slate background
- Inputs: Dark slate with light text
- Buttons: Adjusted colors for readability

Toggle dark mode in user settings.

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **G** | Use current GPS location |
| **Shift + ↑** | Increase 3D pitch |
| **Shift + ↓** | Decrease 3D pitch |
| **Shift + ←** | Rotate counterclockwise |
| **Shift + →** | Rotate clockwise |
| **Right-click** | Reset to NUST campus view |

---

## File Changes Summary

### New Files
- `resources/js/components/MapHeader.tsx`

### Updated Files
- `resources/js/pages/Dashboard.tsx` - New layout structure
- `resources/js/components/MapComponent.tsx` - Move WalkControl to bottom-left
- `resources/css/app.css` - New map layout styles

### Removed Files
- None (DashboardModern.tsx merged into Dashboard.tsx)

---

## Browser Compatibility

- ✅ Chrome/Chromium (88+)
- ✅ Firefox (87+)
- ✅ Safari (14+)
- ✅ Edge (88+)

---

## Troubleshooting

### Sidebar Won't Open
- Check browser console for JavaScript errors
- Ensure hamburger button is visible
- Try refreshing the page

### GPS Button Not Working
- See [GPS_LOCATION_GUIDE.md](GPS_LOCATION_GUIDE.md)
- Check location permissions
- Ensure HTTPS or localhost

### Map Controls Not Visible
- Zoom out slightly to see bottom-left controls
- Check that map has finished loading
- Scroll down if on mobile

### Dark Mode Not Applied
- Check user settings
- Clear browser cache
- Verify `dark:` classes in CSS

---

## Migration Guide (From Old Layout)

If you were using the old layout:

**Old:** Sidebar always visible + Top panel with controls
**New:** Collapsible sidebar + Header navigation + Bottom controls

| Old Feature | New Location |
|-------------|-------------|
| Navigation Menu | Left sidebar (toggle with ☰) |
| Search inputs | Bottom-left map controls |
| GPS button | Header top-right |
| Map controls | Bottom-left (was top-right) |

---

## Performance Notes

- **Sidebar Animation**: Uses CSS transitions (GPU accelerated)
- **No Layout Shifts**: Fixed header prevents content reflow
- **Minimal Re-renders**: State updates isolated to Dashboard component
- **Mobile Optimized**: Sidebar overlay reduces touch confusion

---

## Future Enhancements

- [ ] Search suggestions in header
- [ ] Recent searches dropdown
- [ ] Saved locations sidebar
- [ ] Map theme switcher in header
- [ ] Settings panel in header
- [ ] User profile menu in header

---

## Support

For issues or feature requests related to the UI redesign:
1. Check this guide first
2. Review [GPS_LOCATION_GUIDE.md](GPS_LOCATION_GUIDE.md) for GPS issues
3. Open GitHub issue with details
4. Contact support team

---

**Version**: 2.0 (Google Maps Style)
**Last Updated**: June 2026
**Status**: Production Ready

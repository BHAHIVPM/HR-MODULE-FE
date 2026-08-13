import { useTheme } from '../../context/ThemeContext';
import './ThemeSettingsPanel.css';

const COLOR_FIELDS = [
  { key: 'primary', label: 'Primary', hint: 'Buttons, links, active states' },
  { key: 'secondary', label: 'Secondary', hint: 'Accents, highlights, badges' },
  { key: 'third', label: 'Third', hint: 'Dark panels, headers, sidebar' },
];

function ThemeSettingsPanel() {
  const { colors, updateColor, resetTheme, showSettings, setShowSettings } = useTheme();

  if (!showSettings) return null;

  return (
    <>
      <div
        className="theme-settings-backdrop"
        onClick={() => setShowSettings(false)}
        aria-hidden="true"
      />
      <aside className="theme-settings-panel" role="dialog" aria-label="Theme settings">
        <div className="theme-settings-header">
          <div>
            <h2>Theme Colors</h2>
            <p>Customize the three core colors used across the app.</p>
          </div>
          <button
            type="button"
            className="theme-settings-close"
            onClick={() => setShowSettings(false)}
            aria-label="Close theme settings"
          >
            <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="theme-settings-preview">
          <div className="theme-preview-swatch" style={{ background: colors.primary }} />
          <div className="theme-preview-swatch" style={{ background: colors.secondary }} />
          <div className="theme-preview-swatch" style={{ background: colors.third }} />
        </div>

        <div className="theme-settings-fields">
          {COLOR_FIELDS.map(({ key, label, hint }) => (
            <div key={key} className="theme-settings-field">
              <label htmlFor={`theme-${key}`}>{label}</label>
              <span className="theme-settings-hint">{hint}</span>
              <div className="theme-settings-color-row">
                <input
                  id={`theme-${key}`}
                  type="color"
                  value={colors[key]}
                  onChange={(e) => updateColor(key, e.target.value)}
                />
                <input
                  type="text"
                  className="theme-settings-hex"
                  value={colors[key]}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9a-fA-F]{6}$/.test(val)) updateColor(key, val);
                  }}
                  maxLength={7}
                />
              </div>
            </div>
          ))}
        </div>

        <button type="button" className="theme-settings-reset" onClick={resetTheme}>
          Reset to defaults
        </button>
      </aside>
    </>
  );
}

export default ThemeSettingsPanel;

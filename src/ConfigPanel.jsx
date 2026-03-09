export default function ConfigPanel({
  draftText, setDraftText, onApplyText,
  boxColor,  setBoxColor,
  lidColor,  setLidColor,
  textColor, setTextColor,
}) {
  return (
    <aside className="config-panel">
      <h3>Customize</h3>
      <label>
        Greeting text
        <div className="row">
          <input
            value={draftText}
            onChange={e => setDraftText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onApplyText()}
          />
          <button onClick={onApplyText}>Apply</button>
        </div>
      </label>
      <label>
        Box colour
        <input type="color" value={boxColor} onChange={e => setBoxColor(e.target.value)} />
      </label>
      <label>
        Lid colour
        <input type="color" value={lidColor} onChange={e => setLidColor(e.target.value)} />
      </label>
      <label>
        Text colour
        <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} />
      </label>
    </aside>
  )
}

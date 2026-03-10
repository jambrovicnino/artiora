import './FinancialTable.css';

export default function FinancialTable({ headers, rows, language }) {
  return (
    <div className="fin-table-wrapper">
      <div className="fin-table-scroll">
        <table className="fin-table">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'even' : 'odd'}>
                <td className="fin-table-label">
                  {language === 'sl' ? row.labelSl : row.labelEn}
                </td>
                {row.values.map((val, j) => (
                  <td key={j} className="fin-table-value">
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

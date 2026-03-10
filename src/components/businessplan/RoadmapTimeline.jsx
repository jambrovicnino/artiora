import './RoadmapTimeline.css';

export default function RoadmapTimeline({ milestones, language }) {
  if (!milestones || milestones.length === 0) return null;

  return (
    <div className="roadmap">
      <div className="roadmap-line" />
      <div className="roadmap-items">
        {milestones.map((m, i) => (
          <div
            key={i}
            className={`roadmap-item${m.done ? ' done' : ' future'}`}
          >
            <div className="roadmap-dot">
              <span className="roadmap-dot-inner" />
            </div>
            <div className="roadmap-content">
              <span className="roadmap-date">{m.date}</span>
              <span className="roadmap-label">
                {language === 'sl' ? m.labelSl : m.labelEn}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

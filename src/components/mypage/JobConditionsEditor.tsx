import { useState } from 'react';

interface JobConditions {
  positions: string[];
  locations: string[];
  experiences: string[];
}

interface JobConditionsEditorProps {
  conditions: JobConditions;
  onSave: (conditions: JobConditions) => void;
  onCancel: () => void;
}

const POSITION_OPTIONS = ['프론트엔드 개발', '백엔드 개발', '풀스택 개발', 'DevOps'];
const LOCATION_OPTIONS = ['서울 강남', '서울 강북', '부산', '대구', '대전'];
const EXPERIENCE_OPTIONS = ['신입', '1년 이상', '3년 이상', '5년 이상'];

export default function JobConditionsEditor({
  conditions,
  onSave,
  onCancel,
}: JobConditionsEditorProps) {
  const [temp, setTemp] = useState<JobConditions>(conditions);

  const addItem = (category: keyof JobConditions, item: string) => {
    if (!temp[category].includes(item)) {
      setTemp({
        ...temp,
        [category]: [...temp[category], item],
      });
    }
  };

  const removeItem = (category: keyof JobConditions, item: string) => {
    setTemp({
      ...temp,
      [category]: temp[category].filter((i) => i !== item),
    });
  };

  return (
    <div className="space-y-6">
      {/* 직무 */}
      <div>
        <div className="text-xs text-app-text-muted mb-3">직무</div>
        <div className="flex gap-2 flex-wrap mb-3">
          {temp.positions.map((pos) => (
            <span
              key={pos}
              className="inline-flex px-3 py-1 bg-app-primary text-white text-xs rounded-full items-center gap-2"
            >
              {pos}
              <button
                onClick={() => removeItem('positions', pos)}
                className="hover:opacity-80"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {POSITION_OPTIONS.filter((p) => !temp.positions.includes(p)).map((pos) => (
            <button
              key={pos}
              onClick={() => addItem('positions', pos)}
              className="px-3 py-1 border border-app-border rounded text-xs hover:bg-app-bg"
            >
              + {pos}
            </button>
          ))}
        </div>
      </div>

      {/* 지역 */}
      <div>
        <div className="text-xs text-app-text-muted mb-3">지역</div>
        <div className="flex gap-2 flex-wrap mb-3">
          {temp.locations.map((loc) => (
            <span
              key={loc}
              className="inline-flex px-3 py-1 bg-app-primary text-white text-xs rounded-full items-center gap-2"
            >
              {loc}
              <button
                onClick={() => removeItem('locations', loc)}
                className="hover:opacity-80"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {LOCATION_OPTIONS.filter((l) => !temp.locations.includes(l)).map((loc) => (
            <button
              key={loc}
              onClick={() => addItem('locations', loc)}
              className="px-3 py-1 border border-app-border rounded text-xs hover:bg-app-bg"
            >
              + {loc}
            </button>
          ))}
        </div>
      </div>

      {/* 경력 */}
      <div>
        <div className="text-xs text-app-text-muted mb-3">경력</div>
        <div className="flex gap-2 flex-wrap mb-3">
          {temp.experiences.map((exp) => (
            <span
              key={exp}
              className="inline-flex px-3 py-1 bg-app-primary text-white text-xs rounded-full items-center gap-2"
            >
              {exp}
              <button
                onClick={() => removeItem('experiences', exp)}
                className="hover:opacity-80"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {EXPERIENCE_OPTIONS.filter((e) => !temp.experiences.includes(e)).map((exp) => (
            <button
              key={exp}
              onClick={() => addItem('experiences', exp)}
              className="px-3 py-1 border border-app-border rounded text-xs hover:bg-app-bg"
            >
              + {exp}
            </button>
          ))}
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-2 pt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-semibold text-app-text-muted hover:text-app-text border border-app-border rounded"
        >
          취소
        </button>
        <button
          onClick={() => onSave(temp)}
          className="px-4 py-2 text-sm font-semibold bg-app-primary text-white rounded hover:opacity-90"
        >
          저장
        </button>
      </div>
    </div>
  );
}
const tones = {
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-green-50 text-green-700',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-700',
  gray: 'bg-gray-100 text-gray-700',
};

const StatCard = ({ label, value, tone = 'blue', sublabel }) => (
  <div className="bg-white rounded shadow p-5">
    <div className={`inline-block text-xs uppercase tracking-wide px-2 py-1 rounded ${tones[tone] || tones.blue}`}>
      {label}
    </div>
    <div className="mt-3 text-3xl font-semibold">{value}</div>
    {sublabel && <div className="text-xs text-gray-500 mt-1">{sublabel}</div>}
  </div>
);

export default StatCard;

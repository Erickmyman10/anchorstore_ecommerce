const AccountCard = ({ icon: Icon, title, action, accent = 'brand', children }) => {
  const styles = {
    brand:  { bg: 'bg-brand-50',  text: 'text-brand-600'  },
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-600'   },
    green:  { bg: 'bg-green-50',  text: 'text-green-600'  },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
  };
  const { bg, text } = styles[accent] ?? styles.brand;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`p-2.5 rounded-xl ${bg}`}>
              <Icon className={`w-5 h-5 ${text}`} />
            </div>
          )}
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
};

export default AccountCard;

import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const PasswordStrength = ({ password }) => {
  const getStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    
    let score = 0;
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };

    if (checks.length) score++;
    if (checks.uppercase) score++;
    if (checks.lowercase) score++;
    if (checks.number) score++;
    if (checks.special) score++;

    let label = '';
    let color = '';
    
    if (score <= 2) {
      label = 'Weak';
      color = 'bg-red-500';
    } else if (score === 3) {
      label = 'Fair';
      color = 'bg-yellow-500';
    } else if (score === 4) {
      label = 'Good';
      color = 'bg-blue-500';
    } else {
      label = 'Strong';
      color = 'bg-green-500';
    }

    return { score, label, color, checks };
  };

  const { score, label, color, checks } = getStrength(password);

  const requirements = [
    { key: 'length', text: 'At least 8 characters' },
    { key: 'uppercase', text: 'One uppercase letter' },
    { key: 'lowercase', text: 'One lowercase letter' },
    { key: 'number', text: 'One number' },
    { key: 'special', text: 'One special character' },
  ];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Strength Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${color}`}
            style={{ width: `${(score / 5) * 100}%` }}
          />
        </div>
        <span className={`text-xs font-semibold ${
          score <= 2 ? 'text-red-600' :
          score === 3 ? 'text-yellow-600' :
          score === 4 ? 'text-blue-600' :
          'text-green-600'
        }`}>
          {label}
        </span>
      </div>

      {/* Requirements List */}
      <div className="space-y-1">
        {requirements.map((req) => {
          const isValid = checks?.[req.key] || false;
          return (
            <div key={req.key} className="flex items-center gap-2 text-xs">
              {isValid ? (
                <CheckCircle className="text-green-600" size={14} />
              ) : (
                <XCircle className="text-gray-400" size={14} />
              )}
              <span className={isValid ? 'text-green-700' : 'text-gray-500'}>
                {req.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PasswordStrength;


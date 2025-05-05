import { Shield, Heart, Clock, Star } from 'lucide-react';

export function TrustBadges() {
  const badges = [
    {
      icon: <Shield className="h-5 w-5 text-primary-500" />,
      text: "Verified Providers"
    },
    {
      icon: <Heart className="h-5 w-5 text-primary-500" />,
      text: "Compassionate Care"
    },
    {
      icon: <Clock className="h-5 w-5 text-primary-500" />,
      text: "24/7 Support"
    },
    {
      icon: <Star className="h-5 w-5 text-primary-500" />,
      text: "5-Star Rated"
    }
  ];

  return (
    <section className="py-6 bg-white border-b border-neutral-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {badges.map((badge, index) => (
            <div key={index} className="flex items-center space-x-2">
              {badge.icon}
              <span className="text-neutral-700 font-medium">{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

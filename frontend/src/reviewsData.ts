interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  isPositive: boolean;
}

export const generateReviews = (): Review[] => {
  const reviews: Review[] = [];
  const positiveComments = [
    'Very good service!',
    'Excellent exchange!',
    'Fast and reliable',
    'Great platform!',
    'Best rates ever',
    'Quick transaction',
    'Professional service',
    'Amazing!',
    'Perfect service!',
    'Highly recommended!',
    'Super fast!',
    'Trustworthy platform',
    'Best exchange service',
    'Love this platform!',
    'Smooth process',
    'Great customer support',
    'No issues at all',
    'Will use again!',
    'Fantastic service!',
    'Top notch!'
  ];
  
  const neutralComments = [
    'Good but money took an hour, usually faster',
    'Mostly satisfied',
    'Minor delay but okay',
    'Could be faster',
    'Acceptable service',
    'Good overall experience',
    'Service is fine',
    'Works well enough',
    'Decent platform',
    'Okay service'
  ];

  const firstNames = ['Alex', 'Maria', 'John', 'Sarah', 'David', 'Emma', 'Michael', 'Lisa', 'James', 'Anna', 
                     'Robert', 'Jennifer', 'William', 'Linda', 'Richard', 'Patricia', 'Joseph', 'Barbara',
                     'Thomas', 'Jessica', 'Charles', 'Susan', 'Christopher', 'Nancy', 'Daniel', 'Karen',
                     'Matthew', 'Betty', 'Anthony', 'Helen', 'Mark', 'Sandra', 'Donald', 'Donna',
                     'Steven', 'Carol', 'Paul', 'Ruth', 'Andrew', 'Sharon', 'Joshua', 'Michelle',
                     'Kevin', 'Laura', 'Brian', 'Sarah', 'George', 'Kimberly', 'Edward', 'Deborah'];

  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
                    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
                    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
                    'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
                    'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];

  for (let i = 1; i <= 1745; i++) {
    const isPositive = Math.random() < 0.97; // 97% positive
    const isAnonymous = Math.random() < 0.3; // 30% anonymous
    
    let userName = 'Anonymous User';
    if (!isAnonymous) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      userName = `${firstName} ${lastName}`;
    }

    const rating = isPositive ? 
      Math.floor(Math.random() * 2) + 4 : // 4-5 for positive
      Math.floor(Math.random() * 2) + 2;  // 2-3 for neutral

    const comments = isPositive ? positiveComments : neutralComments;
    const comment = comments[Math.floor(Math.random() * comments.length)];

    const date = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
    const formattedDate = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });

    reviews.push({
      id: i,
      userName,
      rating,
      comment,
      date: formattedDate,
      isPositive
    });
  }

  return reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export interface ExchangeRequest {
  id: string;
  email: string;
  walletAddress: string;
  fromCurrency: string;
  toCurrency: string;
  amount: string;
  status: 'waiting' | 'processing' | 'completed' | 'expired';
  createdAt: Date;
  emailSent: boolean;
  telegramSent: boolean;
}
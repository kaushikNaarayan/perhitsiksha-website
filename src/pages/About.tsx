import React from 'react';
import Hero from '../components/ui/Hero';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatsCounter from '../components/ui/StatsCounter';

// Import images
import aboutHeroBg from '../assets/images/about-hero-bg.png';

const About: React.FC = () => {
  const timelineEvents = [
    {
      year: '2009',
      title: 'Foundation',
      description: 'PerhitSiksha was founded with a simple mission: to ensure no deserving student is denied education due to financial constraints.',
      milestone: true
    },
    {
      year: '2011',
      title: 'First 50 Students',
      description: 'We supported our first 50 students across various disciplines, establishing our core scholarship program.',
      milestone: false
    },
    {
      year: '2014',
      title: 'Mentorship Program Launch',
      description: 'Launched our comprehensive mentorship program, pairing students with industry professionals.',
      milestone: true
    },
    {
      year: '2017',
      title: '100 Students Milestone',
      description: 'Reached our goal of supporting 100+ students annually, expanding across multiple states.',
      milestone: false
    },
    {
      year: '2020',
      title: 'Digital Transformation',
      description: 'Adapted to provide virtual mentoring and support during the pandemic, ensuring continued assistance.',
      milestone: true
    },
    {
      year: '2023',
      title: '300+ Students Supported',
      description: 'Celebrated supporting over 300 students with a 95% graduation success rate.',
      milestone: true
    },
    {
      year: '2024',
      title: 'Alumni Network',
      description: 'Launched our alumni network, creating a community of successful graduates who give back.',
      milestone: false
    }
  ];

  const values = [
    {
      title: 'Education First',
      description: 'We believe education is the most powerful tool for social transformation and personal empowerment.',
      icon: '📚'
    },
    {
      title: 'Merit & Need',
      description: 'We support students based on both academic merit and financial need, ensuring sustainable impact.',
      icon: '🎯'
    },
    {
      title: 'Holistic Support',
      description: 'Beyond financial aid, we provide mentorship, career guidance, and personal development.',
      icon: '🌱'
    },
    {
      title: 'Transparency',
      description: 'We maintain complete transparency in our operations and fund utilization.',
      icon: '💎'
    }
  ];

  const team = [
    {
      name: 'Dr. Rajesh Sharma',
      role: 'Founder & President',
      bio: 'Former educator with 25+ years in academia, passionate about educational equity.',
      image: '/images/team/rajesh.jpg'
    },
    {
      name: 'Priya Mehta',
      role: 'Program Director',
      bio: 'MBA from IIM, leads our scholarship and mentorship programs.',
      image: '/images/team/priya.jpg'
    },
    {
      name: 'Amit Kumar',
      role: 'Community Outreach',
      bio: 'Social work background, coordinates with educational institutions.',
      image: '/images/team/amit.jpg'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <Hero
        title="About PerhitSiksha"
        subtitle="Empowering underprivileged students through education since 2009."
        backgroundImage={aboutHeroBg}
        overlay={false}
      />

      {/* Mission & Vision */}
      <section className="bg-white section-padding">
        <div className="max-w-4xl mx-auto container-padding">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="heading-2 mb-6">Our Mission</h2>
              <p className="body-large text-gray-700 leading-relaxed">
                To provide financial aid for education of underprivileged, deserving students 
                and mentor them through their journey. We believe every child deserves access 
                to quality education regardless of their economic background.
              </p>
            </div>
            <div>
              <h2 className="heading-2 mb-6">Our Vision</h2>
              <p className="body-large text-gray-700 leading-relaxed">
                To empower every underprivileged child to complete at least intermediate-level 
                education and become self-reliant, contributing members of society who can 
                break the cycle of poverty through education.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Our Values</h2>
            <p className="body-large">
              The principles that guide everything we do.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Numbers */}
      <section className="bg-primary-50 section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Our Impact</h2>
            <p className="body-large">
              Numbers that reflect our commitment to educational empowerment.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatsCounter value={300} suffix="+" label="Students Supported" />
            <StatsCounter value={500} suffix="+" label="Contributors" />
            <StatsCounter value={95} suffix="%" label="Graduation Rate" />
            <StatsCounter value={15} suffix="+" label="Years of Service" />
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-white section-padding">
        <div className="max-w-4xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Our Journey</h2>
            <p className="body-large">
              Key milestones in our mission to democratize education.
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gray-200"></div>

            {timelineEvents.map((event, index) => (
              <div key={index} className="relative flex items-center mb-8">
                <div className={`flex-1 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 order-2'}`}>
                  <Card className="p-6">
                    <div className="flex items-center mb-2">
                      <span className={`inline-block px-3 py-1 text-sm font-bold rounded-full ${
                        event.milestone ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {event.year}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {event.title}
                    </h3>
                    <p className="text-gray-600">
                      {event.description}
                    </p>
                  </Card>
                </div>

                {/* Timeline dot */}
                <div className={`absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white ${
                  event.milestone ? 'bg-primary-500' : 'bg-gray-300'
                }`}></div>

                {/* Spacer for alternating layout */}
                <div className={`flex-1 ${index % 2 === 0 ? 'order-2' : 'pr-8'}`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-gray-50 section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Our Team</h2>
            <p className="body-large">
              Dedicated individuals working towards educational equity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center">
                <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full mb-4 mt-6 flex items-center justify-center">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-3xl text-gray-500">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  )}
                </div>
                <div className="p-6 pt-0">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-primary-500 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {member.bio}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Transparency & Contact */}
      <section className="bg-white section-padding">
        <div className="max-w-4xl mx-auto container-padding">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="heading-3 mb-6">Transparency & Governance</h2>
              <p className="body-base text-gray-700 mb-6">
                We maintain complete transparency in our operations. All donations 
                are tracked and accounted for, with regular reports published for 
                our community.
              </p>
              <div className="space-y-3">
                <Button variant="outline" size="sm" href="/reports">
                  Annual Reports
                </Button>
                <Button variant="outline" size="sm" href="/financials">
                  Financial Statements
                </Button>
                <Button variant="outline" size="sm" href="/governance">
                  Governance Structure
                </Button>
              </div>
            </div>

            <div>
              <h2 className="heading-3 mb-6">Get in Touch</h2>
              <p className="body-base text-gray-700 mb-6">
                Have questions about our work or want to get involved? 
                We'd love to hear from you.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-primary-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:contact@perhitsiksha.org" className="text-gray-700 hover:text-primary-500">
                    contact@perhitsiksha.org
                  </a>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-primary-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-700">+91 98765 43210</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-primary-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-700">
                    123 Education Street,<br />
                    New Delhi, India 110001
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary-500 text-white section-padding">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <h2 className="heading-2 mb-4">Join Our Mission</h2>
          <p className="body-large mb-8">
            Together, we can ensure that every deserving student gets the education they need 
            to transform their lives and communities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" href="#contribute">
              Support a Student
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-white border-white hover:bg-white hover:text-primary-500"
              href="/testimonials"
            >
              See Our Impact
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
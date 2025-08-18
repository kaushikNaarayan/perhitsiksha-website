import React from 'react';
import Hero from '../components/ui/Hero';
import Card from '../components/ui/Card';

// Import images
import aboutHeroBg from '../assets/images/about-hero-bg.png';

const About: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <Hero
        title="About CLSI"
        subtitle="Empowering underprivileged students through education since 2009."
        backgroundImage={aboutHeroBg}
        overlay={false}
      />

      {/* About Section */}
      <section className="bg-white section-padding">
        <div className="max-w-4xl mx-auto container-padding">
          <div className="mb-12">
            <h2 className="heading-2 mb-6">About</h2>
            <div className="space-y-6 body-large text-gray-700 leading-relaxed">
              <p>
                Perhit Siksha (now CLSI) is a not-for-profit forum dedicated to transforming the lives of deserving underprivileged children through the means of education. Operating mainly in the states of Uttar Pradesh, Uttarakhand and Andhra Pradesh, CLSI provides direct financial support to the families of deserving underprivileged students to aid their education. By providing money directly into the bank accounts of the concerned families, their dignity is preserved while removing barriers in the quest of obtaining quality education.
              </p>
              <p>
                Driven by over 400 satisfied contributors, our working model ensures accountability, credibility, transparency and visible impact. Through a unique blend of direct financial assistance coupled with dedicated mentorship we provide deserving children not just the means but also the guidance to succeed.
              </p>
              <p>
                Our functioning goes beyond funding; we provide financial and emotional support to these budding talents and celebrate each child's step-by-step progress towards a more equitable future. At the same time, we build the connection between the child and the contributor which gets strengthened over time. The contributor is kept aware of the child's progress, academic and otherwise, at every step.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="bg-gray-50 section-padding">
        <div className="max-w-4xl mx-auto container-padding">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="heading-2 mb-6">Vision</h2>
              <p className="body-large text-gray-700 leading-relaxed">
                To empower every underprivileged child by providing opportunities to complete at least intermediate-level education, nurturing academic potential and thereby paving the way for a brighter future.
              </p>
            </div>
            <div>
              <h2 className="heading-2 mb-6">Mission</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <p className="body-large text-gray-700">
                    To provide financial aid for education of underprivileged deserving students in a dignified manner without intermediaries.
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <p className="body-large text-gray-700">
                    To mentor, guide and provide support to children academically and emotionally through the course of their educational journey.
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <p className="body-large text-gray-700">
                    To build a transparent, trustworthy and reliable platform driven by collective trust of the Contributors.
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <p className="body-large text-gray-700">
                    To identify and enable promising children from underprivileged backgrounds to rise beyond their socio-economic limitations, through the instrument of education.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Our Values</h2>
            <p className="body-large">
              The principles that guide everything we do.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Education First
              </h3>
              <p className="body-base text-gray-700">
                We believe education is the most powerful tool for social transformation and personal empowerment.
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Merit & Need
              </h3>
              <p className="body-base text-gray-700">
                We support students based on both academic merit and financial need, ensuring sustainable impact.
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Holistic Support
              </h3>
              <p className="body-base text-gray-700">
                Beyond financial aid, we provide mentorship, career guidance, and personal development.
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Transparency
              </h3>
              <p className="body-base text-gray-700">
                We maintain complete transparency in our operations and fund utilization.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Journey */}
      <section className="bg-gray-50 section-padding">
        <div className="max-w-4xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Our Journey</h2>
            <p className="body-large">
              Key milestones in our mission to democratize education.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-lg mr-6">
                2022
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Foundation</h3>
                <p className="body-base text-gray-700">CLSI was established with a vision to transform lives through education.</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-20 h-20 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-lg mr-6">
                2023
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">50 Students</h3>
                <p className="body-base text-gray-700">Reached our first milestone of supporting 50 deserving students.</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-20 h-20 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-lg mr-6">
                2024
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">100 Students</h3>
                <p className="body-base text-gray-700">Doubled our impact by supporting 100 students across multiple states.</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-20 h-20 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-lg mr-6">
                2025
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">300 Students</h3>
                <p className="body-base text-gray-700">Tripled our reach, supporting 300 students and expanding our mentorship programs.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="bg-white section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Our Team</h2>
            <p className="body-large">
              Dedicated individuals working towards educational equity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6">
              <div className="w-24 h-24 mx-auto bg-primary-100 rounded-full mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-600">SR</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Sanjay Rathi</h3>
              <p className="text-primary-500 font-medium">Founder</p>
            </Card>
            
            <Card className="text-center p-6">
              <div className="w-24 h-24 mx-auto bg-primary-100 rounded-full mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-600">JP</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Jitendra Patel</h3>
              <p className="text-primary-500 font-medium">Program Director</p>
            </Card>
            
            <Card className="text-center p-6">
              <div className="w-24 h-24 mx-auto bg-primary-100 rounded-full mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-600">PMA</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Priya Manu Arora</h3>
              <p className="text-primary-500 font-medium">Program Director</p>
            </Card>
            
            <Card className="text-center p-6">
              <div className="w-24 h-24 mx-auto bg-primary-100 rounded-full mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-600">AS</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Akansha Srivastav</h3>
              <p className="text-primary-500 font-medium">Community Outreach</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-gray-50 section-padding">
        <div className="max-w-4xl mx-auto container-padding">
          <div className="text-center mb-8">
            <h2 className="heading-2 mb-4">Get in Touch</h2>
            <p className="body-large">
              Have questions about our work or want to get involved? We'd love to hear from you.
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="space-y-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-primary-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:clsi.perhitsiksha@gmail.com" className="text-gray-700 hover:text-primary-500">
                  clsi.perhitsiksha@gmail.com
                </a>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-primary-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="https://wa.me/918142238633" className="text-gray-700 hover:text-primary-500">
                  +91 81422 38633
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
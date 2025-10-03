import React from 'react';
import Hero from '../components/ui/Hero';
import Card from '../components/ui/Card';
import {
  FaGraduationCap,
  FaBullseye,
  FaSeedling,
  FaGem,
  FaEnvelope,
  FaPhone,
  FaEye,
  FaRocket,
  FaHeart,
  FaUsers,
} from 'react-icons/fa';
import Button from '../components/ui/Button';

// Import images
import aboutHeroBg from '../assets/images/about-hero-bg.png';

const About: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <Hero
        title="Transforming Lives Through Education"
        subtitle="Empowering underprivileged students to achieve their dreams through quality education and mentorship since 2022."
        backgroundImage={aboutHeroBg}
        overlay={true}
      />

      {/* Who We Are Section */}
      <section className="bg-white section-padding">
        <div className="max-w-6xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-6">Who We Are</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Perhit Siksha (now CLSI) is a forum dedicated to breaking the
              cycle of poverty through education. Since 2022, we've been
              transforming the lives of deserving underprivileged children
              across India.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-3xl font-bold text-gray-900">
                  Our Approach
                </h3>
                <p className="body-large text-gray-700 leading-relaxed">
                  We believe in providing direct financial support to families
                  while preserving their dignity. Our approach removes barriers
                  to quality education by addressing both financial constraints
                  and emotional support needs.
                </p>
                <p className="body-large text-gray-700 leading-relaxed">
                  Operating primarily in Uttar Pradesh, Uttarakhand, and Andhra
                  Pradesh, we create sustainable pathways for students to
                  achieve their educational goals and break generational cycles
                  of poverty.
                </p>
              </div>

              <div className="bg-primary-50 p-6 rounded-2xl border border-primary-100">
                <h4 className="text-lg font-bold text-primary-900 mb-4 flex items-center">
                  <FaHeart className="mr-3 text-primary-600" />
                  Why It Matters
                </h4>
                <p className="text-primary-800 leading-relaxed">
                  Every child deserves the opportunity to learn, grow, and
                  achieve their dreams. Education is not just about
                  academics—it's about hope, dignity, and the power to transform
                  entire communities.
                </p>
              </div>
            </div>

            <div className="bg-primary-500 p-8 rounded-2xl text-white shadow-sm">
              <h4 className="text-xl font-bold mb-6 text-center">
                Our Impact in Numbers
              </h4>
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">200+</div>
                  <div className="text-sm text-primary-100">
                    Students Supported
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">400+</div>
                  <div className="text-sm text-primary-100">Contributors</div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-primary-400 text-center">
                <p className="text-sm text-primary-100">
                  Every contribution directly impacts a student's educational
                  journey
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-md transition-all duration-300 border-0 bg-primary-50">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-500 rounded-full flex items-center justify-center">
                <FaBullseye className="text-2xl text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Accountability
              </h4>
              <p className="text-gray-700 leading-relaxed">
                Rigorous monitoring ensures every rupee reaches its intended
                purpose with complete transparency and measurable impact.
              </p>
            </Card>
            <Card className="p-8 text-center hover:shadow-md transition-all duration-300 border-0 bg-gray-50">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-600 rounded-full flex items-center justify-center">
                <FaSeedling className="text-2xl text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Holistic Mentorship
              </h4>
              <p className="text-gray-700 leading-relaxed">
                Beyond financial aid, we provide dedicated academic guidance,
                career counseling, and emotional support throughout their
                journey.
              </p>
            </Card>
            <Card className="p-8 text-center hover:shadow-md transition-all duration-300 border-0 bg-primary-50">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-500 rounded-full flex items-center justify-center">
                <FaUsers className="text-2xl text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Community Connection
              </h4>
              <p className="text-gray-700 leading-relaxed">
                We foster lasting relationships between contributors and
                students, creating a supportive community that celebrates every
                milestone.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="bg-gray-50 section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-6">Our Vision & Mission</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Guided by our unwavering commitment to educational equity and
              social transformation
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Vision Card */}
            <Card className="hover:shadow-lg transition-all duration-300 border border-primary-200 bg-white">
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mr-4">
                    <FaEye className="text-3xl text-primary-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Our Vision
                  </h3>
                </div>
                <p className="text-lg leading-relaxed text-gray-700">
                  To empower every underprivileged child by providing
                  opportunities to complete at least intermediate-level
                  education, nurturing their academic potential and paving the
                  way for a brighter, more equitable future.
                </p>
                <div className="mt-6 pt-6 border-t border-primary-200">
                  <p className="text-sm text-primary-600 italic">
                    "Education is the most powerful weapon which you can use to
                    change the world." - Nelson Mandela
                  </p>
                </div>
              </div>
            </Card>

            {/* Mission Card */}
            <Card className="hover:shadow-lg transition-all duration-300 border border-primary-200 bg-primary-50">
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mr-4">
                    <FaRocket className="text-3xl text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Our Mission
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-primary-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <p className="text-gray-700 leading-relaxed">
                      Provide dignified financial aid for education without
                      intermediaries
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-primary-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <p className="text-gray-700 leading-relaxed">
                      Offer comprehensive academic and emotional mentorship
                      throughout their journey
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-primary-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <p className="text-gray-700 leading-relaxed">
                      Build a transparent, trustworthy platform driven by
                      collective commitment
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-primary-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <p className="text-gray-700 leading-relaxed">
                      Enable promising children to transcend socio-economic
                      limitations through education
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Core Principles */}
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
              How We Make It Happen
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary-500 rounded-2xl flex items-center justify-center">
                  <FaHeart className="text-2xl text-white" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  With Dignity
                </h4>
                <p className="text-gray-600 text-sm">
                  Preserving self-respect while providing support
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-600 rounded-2xl flex items-center justify-center">
                  <FaGem className="text-2xl text-white" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  With Transparency
                </h4>
                <p className="text-gray-600 text-sm">
                  Complete accountability in every transaction
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary-500 rounded-2xl flex items-center justify-center">
                  <FaUsers className="text-2xl text-white" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  With Community
                </h4>
                <p className="text-gray-600 text-sm">
                  Building lasting connections that inspire and sustain
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-6">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The fundamental principles that guide every decision we make and
              action we take in our mission to transform lives.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-8 text-center hover:shadow-md transition-all duration-300 border-0 bg-primary-50">
              <div className="w-20 h-20 mx-auto mb-6 bg-primary-500 rounded-2xl flex items-center justify-center">
                <FaGraduationCap className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Education First
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Education is the cornerstone of social transformation—the most
                powerful instrument for personal empowerment and community
                development.
              </p>
            </Card>
            <Card className="p-8 text-center hover:shadow-md transition-all duration-300 border-0 bg-gray-50">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-500 rounded-2xl flex items-center justify-center">
                <FaBullseye className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Merit & Need
              </h3>
              <p className="text-gray-700 leading-relaxed">
                We carefully balance academic potential with financial
                necessity, ensuring our support creates the maximum sustainable
                impact for deserving students.
              </p>
            </Card>
            <Card className="p-8 text-center hover:shadow-md transition-all duration-300 border-0 bg-primary-50">
              <div className="w-20 h-20 mx-auto mb-6 bg-primary-500 rounded-2xl flex items-center justify-center">
                <FaSeedling className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Holistic Growth
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Our support extends far beyond financial aid—we nurture academic
                excellence, career readiness, and personal development for
                lifelong success.
              </p>
            </Card>
            <Card className="p-8 text-center hover:shadow-md transition-all duration-300 border-0 bg-gray-50">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-500 rounded-2xl flex items-center justify-center">
                <FaGem className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Transparency
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Every contribution is tracked and reported with complete
                transparency, ensuring trust and accountability in all our
                operations and fund utilization.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Journey */}
      <section className="bg-gray-50 section-padding">
        <div className="max-w-4xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">Our Journey</h2>
            <p className="body-large text-gray-600">
              Key milestones in our mission to democratize education
            </p>
          </div>

          <div className="relative">
            {/* Timeline line - vertical for both mobile and desktop */}
            <div className="absolute left-8 md:left-12 top-0 bottom-0 w-1 bg-primary-400"></div>

            <div className="space-y-8">
              {/* 2022 - Foundation */}
              <div className="relative flex items-start">
                <div className="relative z-10 flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-primary-500 text-white rounded-full shadow-sm flex-shrink-0">
                  <div className="text-center">
                    <div className="text-sm md:text-base font-bold">2022</div>
                  </div>
                </div>
                <div className="ml-6 md:ml-8 flex-1">
                  <Card className="p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-primary-500 rounded-full mr-3"></div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Foundation
                      </h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      CLSI was established with a vision to transform lives
                      through education and create lasting impact in
                      communities.
                    </p>
                  </Card>
                </div>
              </div>

              {/* 2023 - First Milestone */}
              <div className="relative flex items-start">
                <div className="relative z-10 flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-primary-500 text-white rounded-full shadow-sm flex-shrink-0">
                  <div className="text-center">
                    <div className="text-sm md:text-base font-bold">2023</div>
                  </div>
                </div>
                <div className="ml-6 md:ml-8 flex-1">
                  <Card className="p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border-l-4 border-primary-300">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-primary-500 rounded-full mr-3"></div>
                      <h3 className="text-xl font-bold text-gray-900">
                        50 Students
                      </h3>
                      <span className="ml-2 text-xs px-2 py-1 bg-primary-100 text-primary-600 rounded-full">
                        Milestone
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      Reached our first major milestone of supporting 50
                      deserving students, establishing our foundation for
                      growth.
                    </p>
                  </Card>
                </div>
              </div>

              {/* 2024 - Expansion */}
              <div className="relative flex items-start">
                <div className="relative z-10 flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-primary-500 text-white rounded-full shadow-sm flex-shrink-0">
                  <div className="text-center">
                    <div className="text-sm md:text-base font-bold">2024</div>
                  </div>
                </div>
                <div className="ml-6 md:ml-8 flex-1">
                  <Card className="p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border-l-4 border-gray-300">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                      <h3 className="text-xl font-bold text-gray-900">
                        100 Students
                      </h3>
                      <span className="ml-2 text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                        Growth
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      Doubled our impact by supporting 100 students across
                      multiple states, expanding our geographical reach.
                    </p>
                  </Card>
                </div>
              </div>

              {/* 2025 - Future Vision */}
              <div className="relative flex items-start">
                <div className="relative z-10 flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-primary-600 text-white rounded-full shadow-sm flex-shrink-0 ring-4 ring-primary-100">
                  <div className="text-center">
                    <div className="text-sm md:text-base font-bold">2025</div>
                  </div>
                </div>
                <div className="ml-6 md:ml-8 flex-1">
                  <Card className="p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border-l-4 border-primary-300 bg-primary-50">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-primary-500 rounded-full mr-3"></div>
                      <h3 className="text-xl font-bold text-gray-900">
                        200+ Students
                      </h3>
                      <span className="ml-2 text-xs px-2 py-1 bg-primary-100 text-primary-600 rounded-full">
                        Vision
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      Significantly expanding our reach to support over 200
                      students while enhancing our mentorship programs and
                      community impact.
                    </p>
                  </Card>
                </div>
              </div>
            </div>

            {/* Timeline end indicator */}
            <div className="relative flex items-start mt-8">
              <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-primary-300 rounded-full shadow-sm flex-shrink-0 ml-4 md:ml-6">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="ml-6 md:ml-8 flex-1">
                <p className="text-sm text-gray-500 italic">
                  Our journey continues...
                </p>
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
            <Card className="text-center p-6 hover:shadow-md transition-all duration-300">
              <div className="w-24 h-24 mx-auto bg-primary-500 rounded-full mb-4 flex items-center justify-center shadow-sm">
                <span className="text-2xl font-bold text-white">SR</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Sanjay Rathi
              </h3>
              <p className="text-primary-600 font-medium mb-2">Founder</p>
              <p className="text-sm text-gray-600">
                Visionary leader driving educational transformation
              </p>
            </Card>

            <Card className="text-center p-6 hover:shadow-md transition-all duration-300">
              <div className="w-24 h-24 mx-auto bg-gray-500 rounded-full mb-4 flex items-center justify-center shadow-sm">
                <span className="text-2xl font-bold text-white">JP</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Jitendra Patel
              </h3>
              <p className="text-gray-600 font-medium mb-2">Program Director</p>
              <p className="text-sm text-gray-600">
                Coordinating student support programs
              </p>
            </Card>

            <Card className="text-center p-6 hover:shadow-md transition-all duration-300">
              <div className="w-24 h-24 mx-auto bg-primary-500 rounded-full mb-4 flex items-center justify-center shadow-sm">
                <span className="text-xl font-bold text-white">PMA</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Priya Manu Arora
              </h3>
              <p className="text-primary-600 font-medium mb-2">
                Program Director
              </p>
              <p className="text-sm text-gray-600">
                Managing educational initiatives
              </p>
            </Card>

            <Card className="text-center p-6 hover:shadow-md transition-all duration-300">
              <div className="w-24 h-24 mx-auto bg-gray-500 rounded-full mb-4 flex items-center justify-center shadow-sm">
                <span className="text-2xl font-bold text-white">AS</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Akansha Srivastav
              </h3>
              <p className="text-gray-600 font-medium mb-2">
                Community Outreach
              </p>
              <p className="text-sm text-gray-600">
                Building community connections
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary-500 text-white section-padding">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <h2 className="heading-2 mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Join us in transforming lives through education. Every contribution
            creates ripples of change that last generations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              size="lg"
              href="https://wa.me/918142238633?text=Hi,%20I%20would%20like%20to%20contribute."
              className="text-primary-500 border-white hover:bg-white"
            >
              Become a Contributor
            </Button>
            <Button
              variant="outline"
              size="lg"
              href="/testimonials"
              className="text-white border-white hover:bg-white hover:text-primary-500"
            >
              See Impact Stories
            </Button>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-gray-50 section-padding">
        <div className="max-w-4xl mx-auto container-padding">
          <div className="text-center mb-8">
            <h2 className="heading-2 mb-4">Get in Touch</h2>
            <p className="body-large">
              Have questions about our work or want to get involved? We'd love
              to hear from you.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="space-y-4">
              <div className="flex items-center">
                <FaEnvelope className="w-5 h-5 text-primary-500 mr-3" />
                <a
                  href="mailto:clsi.perhitsiksha@gmail.com"
                  className="text-gray-700 hover:text-primary-500 transition-colors duration-200"
                >
                  clsi.perhitsiksha@gmail.com
                </a>
              </div>
              <div className="flex items-center">
                <FaPhone className="w-5 h-5 text-primary-500 mr-3" />
                <a
                  href="https://wa.me/918142238633?text=Hi,%20I%20would%20like%20to%20contribute."
                  className="text-gray-700 hover:text-primary-500 transition-colors duration-200"
                >
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

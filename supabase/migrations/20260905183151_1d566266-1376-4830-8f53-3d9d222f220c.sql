
-- roles
CREATE TYPE public.app_role AS ENUM ('admin','editor');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "own profile write" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name',''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- services
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  audience text NOT NULL DEFAULT '',
  pricing text NOT NULL DEFAULT '',
  process text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'code',
  sort_order int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read services" ON public.services FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "admins manage services" ON public.services FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER t_services BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- blog
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'News',
  excerpt text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  cover_url text,
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read posts" ON public.blog_posts FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "admins manage posts" ON public.blog_posts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER t_posts BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- case studies
CREATE TABLE public.case_studies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  client text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  summary text NOT NULL DEFAULT '',
  outcome text NOT NULL DEFAULT '',
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.case_studies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_studies TO authenticated;
GRANT ALL ON public.case_studies TO service_role;
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read cases" ON public.case_studies FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "admins manage cases" ON public.case_studies FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- testimonials
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  organisation text NOT NULL DEFAULT '',
  quote text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read testimonials" ON public.testimonials FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "admins manage testimonials" ON public.testimonials FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- faqs
CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL DEFAULT 'General',
  question text NOT NULL,
  answer text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read faqs" ON public.faqs FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "admins manage faqs" ON public.faqs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- gadgets
CREATE TABLE public.gadgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price_kes numeric,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gadgets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gadgets TO authenticated;
GRANT ALL ON public.gadgets TO service_role;
ALTER TABLE public.gadgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read gadgets" ON public.gadgets FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "admins manage gadgets" ON public.gadgets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- team
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.team_members TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT ALL ON public.team_members TO service_role;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read team" ON public.team_members FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "admins manage team" ON public.team_members FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- editable page sections
CREATE TABLE public.page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  section_key text NOT NULL,
  heading text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (page, section_key)
);
GRANT SELECT ON public.page_sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_sections TO authenticated;
GRANT ALL ON public.page_sections TO service_role;
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read sections" ON public.page_sections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage sections" ON public.page_sections FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER t_sections BEFORE UPDATE ON public.page_sections FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- enquiries
CREATE TABLE public.enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'contact',
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  organisation text,
  service text,
  preferred_date text,
  message text NOT NULL DEFAULT '',
  handled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.enquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enquiries TO authenticated;
GRANT ALL ON public.enquiries TO service_role;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can send enquiry" ON public.enquiries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read enquiries" ON public.enquiries FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update enquiries" ON public.enquiries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete enquiries" ON public.enquiries FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- seed content
INSERT INTO public.services (slug,title,summary,description,audience,pricing,process,icon,sort_order) VALUES
('school-coding-curriculum','School Coding Curriculum','A structured, standards-aligned coding programme for primary and secondary schools.','Python, JavaScript, game development, mobile and web app development, AI/ML foundations and hardware programming with Arduino. Lessons are project-based, delivered termly, and aligned with educational standards so learners build real, working products.','Primary and secondary schools, teachers and school administrators looking for a ready-to-run coding partner.','Priced per school per term based on learner numbers. Request a quote for your school.','Curriculum walkthrough with school leadership, teacher onboarding, termly delivery, learner showcase at the end of each term.','graduation-cap',1),
('it-consultancy','IT Consultancy','Practical technology guidance and infrastructure optimisation.','We audit your current setup, identify gaps and give you a clear, costed roadmap. From computer lab planning to device procurement and software licensing, we help schools and organisations spend wisely.','Schools, NGOs, SMEs and organisations planning or upgrading their technology.','Scoped per engagement after a free discovery call.','Discovery call, on-site or remote audit, written recommendations, implementation support.','lightbulb',2),
('computer-networking','Computer Networking','Reliable network setup, cabling and ongoing support.','Structured cabling, wireless coverage, routers and switches, internet failover and network security. We design, install and maintain networks that keep labs and offices online.','Schools, campuses, offices and community centres.','Quoted per site after a survey.','Site survey, network design, installation, testing and handover, optional support retainer.','network',3),
('coding-content-licensing','Coding Content Licensing','License our curriculum content for your school or personal learning.','Full access to lesson plans, learner workbooks, project briefs and assessment tools. Schools can run the programme with their own teachers; individuals can learn at their own pace.','Schools running their own coding lessons, tutors, and individual learners.','From approximately KSh 10,000 per year for an individual licence. School licences quoted per learner count. Confirm current rates with our team.','Choose a licence type, sign the agreement, receive portal access, join quarterly content updates.','book-open',4),
('tech-gadgets','Tech Gadgets','Learning-ready devices and kits that support our programmes.','Arduino kits, sensors, robotics components, laptops and accessories selected to work with our curriculum. Enquiry-based ordering with delivery across Kenya.','Schools equipping labs, parents supporting learners at home, and individual makers.','Priced per item. Send an enquiry for current pricing and bulk school rates.','Send an enquiry, receive a quote, confirm order, delivery and setup support.','cpu',5),
('digital-books','Digital Books','CBC-aligned digital books for Grade 1 to Grade 4.','Illustrated, interactive digital books built around the CBC syllabus for lower primary. Pay to access content, read on any device, and track progress class by class.','Lower primary schools, teachers and parents of Grade 1 to Grade 4 learners.','Paid access per learner or per class. Contact us for current rates.','Choose your grade level, pay for access, receive login details, start reading.','library',6);

INSERT INTO public.page_sections (page,section_key,heading,body,sort_order) VALUES
('home','hero','Nurturing Africa''s next generation of tech leaders','Epaws Solutions partners with schools and communities across Kenya to deliver hands-on coding education, IT consultancy, networking and technology that works.',1),
('home','mission','Our mission','To empower individuals, schools and communities in Africa with accessible, innovative technology solutions — fostering a more equitable, digitally inclusive future.',2),
('about','story','Our story','Epaws Solutions was founded in Kenya with one belief: young Africans should build technology, not just consume it. What started with a handful of school coding clubs has grown into a full technology partner for schools, organisations and families across the country.',1),
('about','vision','Vision & mission','We see an Africa where every learner has a path into technology. We get there by making world-class coding education affordable, locally relevant and delivered by people who know African classrooms.',2),
('about','values','What we stand for','Practical over theoretical. Local over imported. Every learner finishes with something they built themselves.',3),
('about','why-africa','Why Kenya, why Africa','Africa has the world''s youngest population and the fastest growing demand for digital skills. Building that capacity at school level is the highest-leverage work we can do.',4),
('how-we-work','intro','How we work','Four clear steps from first conversation to a programme running in your school or organisation.',1),
('contact','intro','Talk to us','Tell us about your school or organisation and we will come back to you within one working day.',1);

INSERT INTO public.case_studies (title,client,location,summary,outcome,sort_order) VALUES
('Building a coding club from scratch','Riverside Junior School','Nairobi','We set up a 24-station lab and trained four teachers to run weekly Python and Scratch sessions for Grades 4 to 8.','Over 180 learners now code weekly, and the school''s first learner-built game was demoed at a county science fair.',1),
('Campus-wide network upgrade','St. Monica Secondary','Kiambu','Full structured cabling, wireless coverage across three blocks and internet failover for a 900-student campus.','Downtime dropped from several hours a week to near zero, and online exams now run without interruption.',2),
('Arduino and robotics pathway','Hillview Academy','Nakuru','A hardware programming pathway combining Arduino kits with our curriculum for the senior class.','Two learner teams qualified for a national robotics showcase in their first year.',3);

INSERT INTO public.testimonials (name,role,organisation,quote,sort_order) VALUES
('Grace Wanjiru','Head Teacher','Riverside Junior School','Epaws did not just deliver equipment. They trained our teachers until they were confident running lessons on their own.',1),
('Peter Otieno','ICT Coordinator','St. Monica Secondary','Our network finally works the way it should. The team was thorough, on time and easy to work with.',2),
('Amina Hassan','Parent','Nairobi','My daughter went from playing games to building one. That shift is worth everything.',3);

INSERT INTO public.faqs (topic,question,answer,sort_order) VALUES
('Schools','How do we start a coding programme at our school?','Request a meeting through this site. We will walk your leadership team through the curriculum, discuss timetabling and send a costed proposal.',1),
('Schools','Do our teachers need coding experience?','No. We train your teachers as part of onboarding and provide lesson plans, worksheets and support throughout the term.',2),
('Schools','Is the curriculum aligned with local standards?','Yes. Our lessons are mapped to educational standards for primary and secondary levels, and our lower-primary digital books follow the CBC syllabus for Grades 1 to 4.',3),
('Parents','What age should my child start?','We run programmes from Grade 1 upwards. Younger learners start with visual, story-led lessons and digital books before moving to written code.',1),
('Parents','Can my child learn outside school?','Yes. An individual content licence gives your child access to the same lessons at home.',2),
('Licensing','What does a licence cost?','Individual licences start from approximately KSh 10,000 per year. School licences depend on learner numbers. Contact us for current rates.',1),
('Services','Do you work outside Nairobi?','Yes. We deliver across Kenya and work with partners for programmes elsewhere in Africa.',1);

INSERT INTO public.gadgets (name,description,price_kes,sort_order) VALUES
('Arduino Starter Kit','Board, breadboard, sensors, LEDs and jumper wires — everything needed for our hardware programming lessons.',7500,1),
('Robotics Chassis Kit','Motors, wheels, chassis and controller for line-following and obstacle-avoidance projects.',12500,2),
('Sensor Expansion Pack','Temperature, ultrasonic, light and motion sensors to extend classroom projects.',4200,3),
('Classroom Laptop','Refurbished, lab-ready laptop configured with our full learning toolchain.',32000,4);

INSERT INTO public.team_members (name,role,bio,sort_order) VALUES
('Epaws Founding Team','Founders','Kenyan engineers and educators who built Epaws around one question: what would it take for every learner here to build technology of their own?',1);

INSERT INTO public.blog_posts (slug,title,category,excerpt,body,published,published_at) VALUES
('why-coding-belongs-in-every-kenyan-classroom','Why coding belongs in every Kenyan classroom','Education','Digital skills are no longer a specialism. Here is why we think coding should sit alongside maths and science from Grade 1.','Africa has the youngest population in the world, and the jobs those learners will hold do not exist yet. What will exist is the need to think structurally, break problems down and build solutions.

Coding teaches exactly that. When a Grade 5 learner debugs a game they wrote themselves, they are practising persistence and logical reasoning in a way no worksheet can match.

The barrier has never been talent. It has been access — to equipment, to trained teachers and to a curriculum that fits the local timetable. That is the gap we work in every day.',true,now() - interval '20 days'),
('five-things-to-check-before-building-a-computer-lab','Five things to check before building a computer lab','IT Consultancy','Most lab projects run over budget for the same handful of reasons. Here is the checklist we use with schools.','1. Power first. Stable power and surge protection matter more than machine specs.

2. Network before devices. A lab without reliable connectivity is a very expensive typing room.

3. Plan for maintenance. Budget for repairs and a support contact from day one.

4. Buy for the curriculum, not the brochure. Match specifications to what learners will actually run.

5. Train the teachers. Equipment without confident staff sits idle.',true,now() - interval '9 days'),
('getting-started-with-arduino-in-school','Getting started with Arduino in school','Curriculum','Hardware programming makes code physical. Here is how we introduce Arduino to a class that has never seen a breadboard.','Start with a blinking LED. It sounds trivial, but the moment a learner makes something in the physical world respond to code they wrote, the abstraction disappears.

From there we move to sensors: light, temperature, distance. Each one becomes a small project with a real question behind it — how bright is this classroom, how far away is that wall.

By the end of a term, teams are building line-following robots and automatic irrigation prototypes for the school garden.',true,now() - interval '3 days');

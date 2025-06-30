import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import RequestForResetPass from "./pages/AuthPages/RequestForResetPass";
import ResetPass from "./pages/AuthPages/ResetPass";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Roles from "./pages/userroles/Roles";
import CreateRole from "./pages/userroles/CreateRole";
import EditRole from "./pages/userroles/EditRole";
import Users from "./pages/users/Users";
import CreateUser from "./pages/users/CreateUser";
import EditUser from "./pages/users/EditUser";
import UserLogs from "./pages/userlogs/UserLogs";
import { ReactNode } from "react";
import  HomePage from './pages/HomePage'
import AddAbout from './pages/about/AddAbout'
import About from './pages/about/About'
import EditAbout from './pages/about/EditAbout'
import AddCompHome  from './pages/company/AddCompHome'
import CompHome from  './pages/company/CompHome'
import EditCompHome  from './pages/company/EditCompHome'
import CompLayout  from './pages/CompLayout'
import AddMCLHome   from './pages/company/mcl-group/AddMCLHome '
import EditMCLHome  from './pages/company/mcl-group/EditMCLHome'
import ViewMCLHome  from './pages/company/mcl-group/ViewMCLHome'
import MCLgroup  from './pages/company/mcl-group/MCLgroup'
import EditMCLgroup  from './pages/company/mcl-group/EditMCLgroup'
import AddMCLgroup  from './pages/company/mcl-group/AddMCLgroup'
import FtHomeLayout  from  './pages/MCLHomeLayout'
import  AddLeadershipHome from './pages/leadership/AddLeadershipHome'
import  EditLeadershipHome from './pages/leadership/EditLeadershipHome'
import  LeadershipHome  from  './pages/leadership/LeadershipHome'
import LeadershipHomeLayout from './pages/LeadershipHomeLayout'
import  DiversityHome  from './pages/diversities/DiversityHome'
import AddDiversityHome  from './pages/diversities/AddDiversityHome'
import  EditDiversityHome from './pages/diversities/EditDiversityHome'
import  DiversityAndInclusionLayout  from  './pages/DiversityAndInclusionLayout'
import Leadership  from './pages/leadership/Leadership'
import  AddLeadership  from './pages/leadership/AddLeadership'
import  EditLeadership from './pages/leadership/EditLeadership'
import  SustainabilityHome  from './pages/sustainability/SustainabilityHome'
import  AddSustainabilityHome  from './pages/sustainability/AddSustainabilityHome'
import  EditSustainabilityHome from './pages/sustainability/EditSustainabilityHome'
import SustainabilityLayout  from './pages/SustainabilityLayout'
import  Sustainability  from './pages/sustainability/Sustainability'
import  AddSustainability  from './pages/sustainability/AddSustainability'
import  EditSustainability  from './pages/sustainability/EditSustainability'
import ViewGivingHome from './pages/givingback/ViewGivingHome'
import AddGivingHome   from  './pages/givingback/AddGivingHome'
import EditGivingHome  from  './pages/givingback/EditGivingHome'
import  GivingBackLayout  from './pages/GivingBackLayout'
import  GivingBack  from './pages/givingback/GivingBack'
import  AddGivingBack  from  './pages/givingback/AddGivingBack' 
import EditGivingBack  from  './pages/givingback/EditGivingBack'
import AddFtPink130Home from './pages/pink130/AddPink130Home'
import  EditFtPink130Home from  './pages/pink130/EditPink130Home'
import  ViewFtPink130Home  from './pages/pink130/ViewPink130Home'
import AddPink130 from './pages/pink130/AddPink130'
import Pink130  from  './pages/pink130/Pink130'
import  EditPink130   from './pages/pink130/EditPink130'
import Pink130Layout from './pages/Pink130Layout'
import ViewOurStandardHome  from './pages/ourstandards/ViewOurStandardHome'
import AddOurStandandardHome from './pages/ourstandards/AddOurStandandardHome'
import EditOurStandandardHome  from './pages/ourstandards/EditOurStandandardHome'
import OurStandardsLayout  from './pages/OurStandardsLayout'
import OurStandards  from './pages/ourstandards/OurStandards'
import AddOurStandards  from './pages/ourstandards/AddOurStandards'
import  EditOurStandards  from  './pages/ourstandards/EditOurStandards'
import  ServicesHome from './pages/services/ServicesHome'
import  AddServicesHome from './pages/services/AddServicesHome'
import  EditServicesHome from './pages/services/EditServicesHome'
import  Service  from  './pages/services/Service'
import AddService  from './pages/services/AddService'
import  EditService  from  './pages/services/EditService'
import   ServicesLayout  from './pages/ServicesLayout'
import  NewsHome  from './pages/news/NewsHome.tsx'
import AddNewsHome from './pages/news/AddNewsHome'
import  EditNewsHome  from './pages/news/EditNewsHome'
import  NewsHomeLayout from  './pages/NewsHomeLayout'
import  AddNews  from './pages/news/AddNews'
import  EditNews from './pages/news/EditNews'
import  News from './pages/news/News'
import  SubNews  from './pages/news/SubNews'
import  AddSubNews  from './pages/news/AddSubNews'
import  EditSubNews  from './pages/news/EditSubNews'
import ContactHome  from './pages/contact/ContactHome'
import AddContactHome  from './pages/contact/AddContactHome'
import  EditContactHome  from './pages/contact/EditContactHome'
import  ContactUs  from  './pages/contact/ContactUs'
import  AddContactUs  from './pages/contact/AddContactUs.tsx'
import  EditContactUs from './pages/contact/EditContactUs.tsx'
import ContactLayout from  './pages/ContactLayout'
import  DiversityInlcusion from './pages/diversities/DiversityInlcusion'
import AddDiversityInclusion  from './pages/diversities/AddDiversityInclusion'
import  EditDiversityInlcusion  from './pages/diversities/EditDiversityInlcusion'
import  ContactUsInfo  from './pages/contact/ContactUsInfo'
import AddContactUsInfo  from  './pages/contact/AddContactUsInfo'
import  EditContactUsInfo  from './pages/contact/EditContactUsInfo'
import EditWhatWeDo  from './pages/whaatwedo/EditWhatWeDo'
import AddWhatWeDo  from './pages/whaatwedo/AddWhatWeDo'
import WhatWeDo  from './pages/whaatwedo/WhatWeDo'
import Wedo  from './pages/whaatwedo/Wedo'
import AddWedo from './pages/whaatwedo/AddWedo'
import Editwedo   from './pages/whaatwedo/Editwedo'
import SubCategoryWeDo  from './pages/whaatwedo/SubCategoryWeDo'
import AddSubCategoryWeDo  from './pages/whaatwedo/AddSubCategoryWeDo'
import EditSubCategoryWeDo  from './pages/whaatwedo/EditSubCategoryWeDo'
import  AddBlogHome  from './pages/blog/AddBlogHome'
import EditBlogHome  from './pages/blog/EditBlogHome'
import  BlogHome  from './pages/blog/BlogHome'
import  Blogs  from './pages/blog/Blogs'
import  AddBlog  from './pages/blog/AddBlog'
import  EditBlog  from './pages/blog/EditBlog'
import EditSubBlog from './pages/blog/EditSubBlog'
import SubBlogs  from './pages/blog/SubBlogs'
import AddSubBlog  from './pages/blog/AddSubBlog'
import BenefitiesHome  from './pages/benefities/BenefitiesHome'
import AddBenefitiesHome  from './pages/benefities/AddBenefitiesHome'
import EditBenefitiesHome from  './pages/benefities/EditBenefitiesHome'
import  AddBenefit  from './pages/benefities/AddBenefit.tsx'
import Benefits  from './pages/benefities/Benefits'
import  EditBenefit  from './pages/benefities/EditBenefit'
import ValuesHome  from './pages/values/ValuesHome'
import  AddValueHome  from './pages/values/AddValueHome'
import  EditValueHome  from './pages/values/EditValueHome'
import Values from './pages/values/Values';
import AddValue from './pages/values/AddValue';
import EditValue from './pages/values/EditValue';
import StayConnectedHome from './pages/stayconnected/StayConnectedHome';
import AddStayConnectedHome from './pages/stayconnected/AddStayConnectedHome';
import EditStayConnectedHome from './pages/stayconnected/EditStayConnectedHome';
import StayConnected from './pages/stayconnected/StayConnected';
import AddStayConnected from './pages/stayconnected/AddStayConnected';
import EditStayConnected from './pages/stayconnected/EditStayConnected';
import EarycareHome from './pages/earycareer/EarycareHome';
import AddEarycareHome from './pages/earycareer/AddEarycareHome';
import EditEarycareHome from './pages/earycareer/EditEarycareHome'
import EarlyCareers from './pages/earycareer/EarlyCareers';
import AddEarlyCareer from './pages/earycareer/AddEarlyCareer';
import EditEarlyCareer from './pages/earycareer/EditEarlyCareer';
import  WhaatWeDoLayout  from './pages/WhaatWeDoLayout'
import  LifeAtBlogLayout  from './pages/LifeAtBlogLayout'
import BenefitiesLayout  from './pages/BenefitiesLayout'
import  ValuesLayout from  './pages/ValuesLayout'
import  EaryCareerLayout from './pages/EaryCareerLayout'
import  StayCoonnectedLayout  from './pages/StayCoonnectedLayout'
import  Brands  from  './pages/brands/Brands'
import  AddBrand  from './pages/brands/AddBrand.tsx'
import  EditBrand from './pages/brands/EditBrand.tsx'
import  OurBrands  from  './pages/OurBrands'
import  Events  from './pages/events/Events'
import  AddOurEvent  from './pages/events/AddOurEvent'
import EditOurEvent from './pages/events/EditOurEvent'
import  EventsLayouts  from  './pages/EventsLayouts'

// Define props for ProtectedRoute
interface ProtectedRouteProps {
  children: ReactNode;
}

// ProtectedRoute component to mimic Vue's navigation guard
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = localStorage.getItem("token");

  // Check if the route requires authentication and if token exists
  if (!token) {
    // Redirect to the sign-in page if no token
    return <Navigate to="/sign-in" replace />;
  }

  // If authenticated, render the children (protected content)
  return children;
};

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout with Protected Routes */}
          <Route element={<AppLayout />}>
            <Route
              index
              path="/dashboard"
              element={
                <ProtectedRoute>
                     <Home />
                </ProtectedRoute>
              }
            />

            {/* Others Page */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfiles />
                </ProtectedRoute>
              }
            />
             <Route
              path="/user-roles"
              element={
                <ProtectedRoute>
                  <Roles />
                </ProtectedRoute>
              }
            />
                  
                  <Route
  path="/edit-role/:roleId"
  element={
    <ProtectedRoute>
      <EditRole />
    </ProtectedRoute>
  }
/>

          
            <Route
              path="/create-role"
              element={
                <ProtectedRoute>
                  <CreateRole />
                </ProtectedRoute>
              }
            />


<Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Users   />
                </ProtectedRoute>
              }
            />


<Route
              path="/create-user"
              element={
                <ProtectedRoute>
                  <CreateUser />
                </ProtectedRoute>
              }
            />

<Route
  path="/edit-user/:userId"
  element={
    <ProtectedRoute>
      <EditUser />
    </ProtectedRoute>
  }
/>

<Route
  path="/user-logs"
  element={
    <ProtectedRoute>
      <UserLogs />
    </ProtectedRoute>
  }

/>

<Route
  path="/add/about"
  element={
    <ProtectedRoute>
      <AddAbout />
    </ProtectedRoute>
  }

/>

<Route
  path="/about"
  element={
    <ProtectedRoute>
      <About />
    </ProtectedRoute>
  }

/>

<Route
  path="/edit-about/:aboutId"
  element={
    <ProtectedRoute>
      <EditAbout />
    </ProtectedRoute>
  }
/>



<Route
  path="/add/company/home"
  element={
    <ProtectedRoute>
      <AddCompHome />
    </ProtectedRoute>
  }

/>

<Route
  path="/company"
  element={
    <ProtectedRoute>
      <CompHome />
    </ProtectedRoute>
  }

/>

<Route
  path="/edit-company/:companyId"
  element={
    <ProtectedRoute>
      <EditCompHome />
    </ProtectedRoute>
  }
/>


<Route path="/mcl-group/home" element={<ProtectedRoute><ViewMCLHome /></ProtectedRoute>} />
<Route path="/add/mcl-home" element={<ProtectedRoute><AddMCLHome /></ProtectedRoute>} />
<Route path="/edit-mcl-home/:mcl_homeId" element={<ProtectedRoute><EditMCLHome /></ProtectedRoute>} />

<Route
  path="/add/mcl-group"
  element={
    <ProtectedRoute>
      <AddMCLgroup />
    </ProtectedRoute>
  }

/>

<Route
  path="/mcl-group"
  element={
    <ProtectedRoute>
      <MCLgroup />
    </ProtectedRoute>
  }

/>

 <Route
    path="/mcl-groups/edit/:mcl_groupId" // The key is `:mcl_groupId`
    element={
      <ProtectedRoute>
        <EditMCLgroup />
      </ProtectedRoute>
    }
  />

<Route
  path="/add/leadership/home"
  element={
    <ProtectedRoute>
      <AddLeadershipHome />
    </ProtectedRoute>
  }
/>

<Route
  path="/leadership/home"
  element={
    <ProtectedRoute>
      <LeadershipHome />
    </ProtectedRoute>
  }
/>

<Route
  path="/edit/leadership/home/:leadership_home_id"
  element={
    <ProtectedRoute>
      <EditLeadershipHome />
    </ProtectedRoute>
  }
/>


<Route
      path="/add/sustainability/home"
      element={
        <ProtectedRoute>
          <AddSustainabilityHome />
        </ProtectedRoute>
      }
    />
    <Route
      path="/sustainability/home"
      element={
        <ProtectedRoute>
          <SustainabilityHome />
        </ProtectedRoute>
      }
    />
    <Route
      path="/edit/sustainability/home/:sustainability_home_id"
      element={
        <ProtectedRoute>
          <EditSustainabilityHome />
        </ProtectedRoute>
      }
    />

<Route path="/sustainability" element={<ProtectedRoute><Sustainability /></ProtectedRoute>} />
<Route path="/add/sustainability" element={<ProtectedRoute><AddSustainability /></ProtectedRoute>} />
<Route path="/edit-sustainability/:sustainabilityId" element={<ProtectedRoute><EditSustainability /></ProtectedRoute>} />

<Route path="/leadership" element={<ProtectedRoute><Leadership /></ProtectedRoute>} />
<Route path="/add-leadership" element={<ProtectedRoute><AddLeadership /></ProtectedRoute>} />
<Route path="/edit-leadership/:leadershipId" element={<ProtectedRoute><EditLeadership /></ProtectedRoute>} />

<Route path="/diversity-and-inclusion" element={<ProtectedRoute><DiversityHome/></ProtectedRoute>} />
<Route path="/add/diversity-and-inclusion" element={<ProtectedRoute><AddDiversityHome /></ProtectedRoute>} />
<Route path="/edit-diversity-home/:dhomeId" element={<ProtectedRoute><EditDiversityHome /></ProtectedRoute>} />

<Route path="/diversityInclusion" element={<ProtectedRoute><DiversityInlcusion/></ProtectedRoute>} />
<Route path="/add/diversityInclusion" element={<ProtectedRoute><AddDiversityInclusion /></ProtectedRoute>} />
<Route path="/edit-diversityInclusion/:dinc_Id" element={<ProtectedRoute><EditDiversityInlcusion /></ProtectedRoute>} />



<Route path="/giving-back" element={<ProtectedRoute><ViewGivingHome /></ProtectedRoute>} />
<Route path="/add/giving-back" element={<ProtectedRoute><AddGivingHome /></ProtectedRoute>} />
<Route path="/edit-giving-back/:giving_backId" element={<ProtectedRoute><EditGivingHome /></ProtectedRoute>} />


// Inside your Router setup
<Route path="/giving/back" element={<ProtectedRoute><GivingBack /></ProtectedRoute>} />
<Route path="/add-giving-backs" element={<ProtectedRoute><AddGivingBack /></ProtectedRoute>} />
<Route path="/edit-giving-backs/:givingId" element={<ProtectedRoute><EditGivingBack /></ProtectedRoute>} />

<Route path="/pink-130" element={<ProtectedRoute><Pink130 /></ProtectedRoute>} />
<Route path="/add/pink-130" element={<ProtectedRoute><AddPink130 /></ProtectedRoute>} />
<Route path="/edit-pink-130/:pinkId" element={<ProtectedRoute><EditPink130 /></ProtectedRoute>} />
          
          
          <Route
            path="/add/mcl-pink-130-home"
            element={
              <ProtectedRoute>
                <AddFtPink130Home
              />
            </ProtectedRoute>
            }
            />
          <Route
            path="/edit-mcl-pink-130-home/:ft_pink_id"
            element={
              <ProtectedRoute>
                <EditFtPink130Home />
              </ProtectedRoute>
            }
            />
            <Route
              path="/mcl-pink-130-home"
              element={
                <ProtectedRoute>
                  <ViewFtPink130Home />
                </ProtectedRoute>
              }
            />




<Route
            path="/add/our-standards/home"
            element={
              <ProtectedRoute>
                <AddOurStandandardHome
              />
            </ProtectedRoute>
            }
            />
          <Route
            path="/edit/our-standard/:standardid"
            element={
              <ProtectedRoute>
                <EditOurStandandardHome />
              </ProtectedRoute>
            }
            />
            <Route
              path="/our-standards/home"
              element={
                <ProtectedRoute>
                  <ViewOurStandardHome/>
                </ProtectedRoute>
              }
            />


            <Route
            path="/add/our_standards"
            element={
              <ProtectedRoute>
                <AddOurStandards
              />
            </ProtectedRoute>
            }
            />
          <Route
            path="/edit/our_standards/:our-standardid"
            element={
              <ProtectedRoute>
                <EditOurStandards />
              </ProtectedRoute>
            }
            />
            <Route
              path="/our_standards"
              element={
                <ProtectedRoute>
                  <OurStandards/>
                </ProtectedRoute>
              }
            />



            <Route
          path="/services/home"
          element={
            <ProtectedRoute>
              <ServicesHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add/services/home"
          element={
            <ProtectedRoute>
              <AddServicesHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-serviceshome/:services_homeId"
          element={
            <ProtectedRoute>
              <EditServicesHome />
            </ProtectedRoute>
          }
        />
   

    <Route
  path="/services"
  element={
    <ProtectedRoute>
      <Service />
    </ProtectedRoute>
  }
/>
<Route
  path="/services/add"
  element={
    <ProtectedRoute>
      <AddService />
    </ProtectedRoute>
  }
/>
<Route
  path="/services/edit/:serviceId"
  element={
    <ProtectedRoute>
      <EditService />
    </ProtectedRoute>
  }
/>



          <Route
  path="/news/home"
  element={
    <ProtectedRoute>
      <NewsHome />
    </ProtectedRoute>
  }
/>
<Route
  path="/add/news/home"
  element={
    <ProtectedRoute>
      <AddNewsHome />
    </ProtectedRoute>
  }
/>


<Route
  path="/edit/news/home/:news_home_id"
  element={
    <ProtectedRoute>
      <EditNewsHome />
    </ProtectedRoute>
  }
/>




     <Route
          path="/news"
          element={
            <ProtectedRoute>
              <News />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add/news"
          element={
            <ProtectedRoute>
              <AddNews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit/news/:news_id"
          element={
            <ProtectedRoute>
              <EditNews />
            </ProtectedRoute>
          }
        />




    <Route
  path="/sub-news"
  element={
    <ProtectedRoute>
      <SubNews />
    </ProtectedRoute>
  }
/>
<Route
  path="/add/sub-news"
  element={
    <ProtectedRoute>
      <AddSubNews />
    </ProtectedRoute>
  }
/>

<Route
  path="/edit/sub-news/:subnews_id"
  element={
    <ProtectedRoute>
      <EditSubNews />
    </ProtectedRoute>
  }
/>


   <Route
      path="/contact/home"
      element={
        <ProtectedRoute>
          <ContactHome />
        </ProtectedRoute>
      }
    />
    <Route
      path="/add/contact/home"
      element={
        <ProtectedRoute>
          <AddContactHome />
        </ProtectedRoute>
      }
    />
    <Route
      path="/edit/contact/home/:cont_home_id"
      element={
        <ProtectedRoute>
          <EditContactHome />
        </ProtectedRoute>
      }
    />


  <Route
      path="/contact-us"
      element={
        <ProtectedRoute>
          <ContactUs />
        </ProtectedRoute>
      }
    />
    <Route
      path="/add/contact-us"
      element={
        <ProtectedRoute>
          <AddContactUs />
        </ProtectedRoute>
      }
    />
    <Route
      path="/edit/contact-us/:cont_us_id"
      element={
        <ProtectedRoute>
          <EditContactUs />
        </ProtectedRoute>
      }
    />

    
  <Route
      path="/contact-us/info"
      element={
        <ProtectedRoute>
          <ContactUsInfo />
        </ProtectedRoute>
      }
    />
    <Route
      path="/add/contact-us/info"
      element={
        <ProtectedRoute>
          <AddContactUsInfo />
        </ProtectedRoute>
      }
    />
    <Route
      path="/edit/contact-us/info/:cont_info_id"
      element={
        <ProtectedRoute>
          <EditContactUsInfo />
        </ProtectedRoute>
      }
    />


<Route
  path="/what-we-do"
  element={
    <ProtectedRoute>
      <WhatWeDo />
    </ProtectedRoute>
  }
/>
<Route
  path="/add/what-we-do"
  element={
    <ProtectedRoute>
      <AddWhatWeDo />
    </ProtectedRoute>
  }
/>
<Route
  path="/edit/what-we-do/:what_we_do_id"
  element={
    <ProtectedRoute>
      <EditWhatWeDo />
    </ProtectedRoute>
  }
/>

<Route
  path="/we-do"
  element={
    <ProtectedRoute>
      <Wedo />
    </ProtectedRoute>
  }
/>
<Route
  path="/add/we-do"
  element={
    <ProtectedRoute>
      <AddWedo  />
    </ProtectedRoute>
  }
/>
<Route
  path="/edit/we-do/:we_do_id"
  element={
    <ProtectedRoute>
      <Editwedo />
    </ProtectedRoute>
  }
/>

<Route
  path="/subcategories/we-do"
  element={
    <ProtectedRoute>
      <SubCategoryWeDo />
    </ProtectedRoute>
  }
/>
<Route
  path="/subcategories/we-do/add"
  element={
    <ProtectedRoute>
      <AddSubCategoryWeDo />
    </ProtectedRoute>
  }
/>
<Route
  path="/subcategories/we-do/edit/:id" 
  element={
    <ProtectedRoute>
      <EditSubCategoryWeDo />
    </ProtectedRoute>
  }
/>

<Route
  path="/blog/home"
  element={
    <ProtectedRoute>
      <BlogHome />
    </ProtectedRoute>
  }
/>
<Route
  path="/add/blog/home"
  element={
    <ProtectedRoute>
      <AddBlogHome />
    </ProtectedRoute>
  }
/>
<Route
  path="/edit/blog-home/:bloghome_id"
  element={
    <ProtectedRoute>
      <EditBlogHome />
    </ProtectedRoute>
  }
/>

<Route
  path="/blogs"
  element={
    <ProtectedRoute>
      <Blogs />
    </ProtectedRoute>
  }
/>
<Route
  path="/add/blogs"
  element={
    <ProtectedRoute>
      <AddBlog />
    </ProtectedRoute>
  }
/>
<Route
  path="/edit/blog/:blog_id"
  element={
    <ProtectedRoute>
      <EditBlog />
    </ProtectedRoute>
  }
/>

<Route
  path="/sub-blogs"
  element={
    <ProtectedRoute>
      <SubBlogs />
    </ProtectedRoute>
  }
/>
<Route
  path="/add/sub-blog"
  element={
    <ProtectedRoute>
      <AddSubBlog />
    </ProtectedRoute>
  }
/>
<Route
  path="/edit/sub-blog/:subblog_id"
  element={
    <ProtectedRoute>
      <EditSubBlog />
    </ProtectedRoute>
  }
/>



<Route
  path="/benefities/home"
  element={
    <ProtectedRoute>
      <BenefitiesHome />
    </ProtectedRoute>
  }
/>
<Route
  path="/add/benefityhome"
  element={
    <ProtectedRoute>
      <AddBenefitiesHome />
    </ProtectedRoute>
  }
/>
<Route
  path="/edit/benefityhome/:benefityhome_id"
  element={
    <ProtectedRoute>
      <EditBenefitiesHome />
    </ProtectedRoute>
  }
/>



<Route
  path="/benefities"
  element={
    <ProtectedRoute>
      <Benefits />
    </ProtectedRoute>
  }
/>
<Route
  path="/add/benefity"
  element={
    <ProtectedRoute>
      <AddBenefit />
    </ProtectedRoute>
  }
/>
<Route
  path="/edit/benefity/:benefity_id"
  element={
    <ProtectedRoute>
      <EditBenefit />
    </ProtectedRoute>
  }
/>

<Route
  path="/value/home"
  element={
    <ProtectedRoute>
      <ValuesHome />
    </ProtectedRoute>
  }
/>
<Route
  path="/add/valuehome"
  element={
    <ProtectedRoute>
      <AddValueHome />
    </ProtectedRoute>
  }
/>
<Route
  path="/edit/valuehome/:values_home_id"
  element={
    <ProtectedRoute>
      <EditValueHome />
    </ProtectedRoute>
  }
/>




<Route
  path="/values"
  element={
    <ProtectedRoute>
      <Values />
    </ProtectedRoute>
  }
/>
<Route
  path="/add/value"
  element={
    <ProtectedRoute>
      <AddValue />
    </ProtectedRoute>
  }
/>
<Route
  path="/edit/value/:value_id"
  element={
    <ProtectedRoute>
      <EditValue />
    </ProtectedRoute>
  }
/>


<Route
  path="/stay-connected/home"
  element={
    <ProtectedRoute>
      <StayConnectedHome />
    </ProtectedRoute>
  }
/>
<Route
  path="/add/stayconnected/home"
  element={
    <ProtectedRoute>
      <AddStayConnectedHome />
    </ProtectedRoute>
  }
/>
<Route
  path="/edit/stay-connectedhome/:s_connectedhome_id"
  element={
    <ProtectedRoute>
      <EditStayConnectedHome />
    </ProtectedRoute>
  }
/>




<Route
  path="/stay-connected"
  element={
    <ProtectedRoute>
      <StayConnected />
    </ProtectedRoute>
  }
/>
<Route
  path="/add/stay-connected"
  element={
    <ProtectedRoute>
      <AddStayConnected />
    </ProtectedRoute>
  }
/>
<Route
  path="/edit/stay-connected/:stay_connected_id"
  element={
    <ProtectedRoute>
      <EditStayConnected />
    </ProtectedRoute>
  }
/>
        



<Route
  path="/early-careers"
  element={
    <ProtectedRoute>
      <EarlyCareers />
    </ProtectedRoute>
  }
/>
<Route
  path="/add/early-career"
  element={
    <ProtectedRoute>
      <AddEarlyCareer />
    </ProtectedRoute>
  }
/>
<Route
  path="/edit/early-career/:early_career_id"
  element={
    <ProtectedRoute>
      <EditEarlyCareer />
    </ProtectedRoute>
  }
/>



<Route
  path="/earycare/home"
  element={
    <ProtectedRoute>
      <EarycareHome />
    </ProtectedRoute>
  }
/>
<Route
  path="/add/earycare/home"
  element={
    <ProtectedRoute>
      <AddEarycareHome />
    </ProtectedRoute>
  }
/>
<Route
  path="/edit/earycarehome/:earycarehome_id"
  element={
    <ProtectedRoute>
      <EditEarycareHome />
    </ProtectedRoute>
  }
/>


<Route
  path="/brands"
  element={
    <ProtectedRoute>
      <Brands />
    </ProtectedRoute>
  }
/>
<Route
  path="/add/brand"
  element={
    <ProtectedRoute>
      <AddBrand />
    </ProtectedRoute>
  }
/>
<Route
  path="/edit/brand/:brand_id"
  element={
    <ProtectedRoute>
      <EditBrand />
    </ProtectedRoute>
  }
/>



<Route
  path="/our-events"
  element={
    <ProtectedRoute>
      <Events />
    </ProtectedRoute>
  }
/>
<Route
  path="/add/our-event"
  element={
    <ProtectedRoute>
      <AddOurEvent />
    </ProtectedRoute>
  }
/>
<Route
  path="/edit/our-event/:event_id"
  element={
    <ProtectedRoute>
      <EditOurEvent />
    </ProtectedRoute>
  }
/>



            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/blank"
              element={
                <ProtectedRoute>
                  <Blank />
                </ProtectedRoute>
              }
            />

            {/* Forms */}
            <Route
              path="/form-elements"
              element={
                <ProtectedRoute>
                  <FormElements />
                </ProtectedRoute>
              }
            />

          

            {/* Ui Elements */}
            <Route
              path="/alerts"
              element={
                <ProtectedRoute>
                  <Alerts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/avatars"
              element={
                <ProtectedRoute>
                  <Avatars />
                </ProtectedRoute>
              }
            />
            <Route
              path="/badge"
              element={
                <ProtectedRoute>
                  <Badges />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buttons"
              element={
                <ProtectedRoute>
                  <Buttons />
                </ProtectedRoute>
              }
            />
            <Route
              path="/images"
              element={
                <ProtectedRoute>
                  <Images />
                </ProtectedRoute>
              }
            />
            <Route
              path="/videos"
              element={
                <ProtectedRoute>
                  <Videos />
                </ProtectedRoute>
              }
            />

            {/* Charts */}
            <Route
              path="/line-chart"
              element={
                <ProtectedRoute>
                  <LineChart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bar-chart"
              element={
                <ProtectedRoute>
                  <BarChart />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Public Routes - Auth Layout */}
          <Route path="/" element={<HomePage />} />
         <Route path="/company/home" element={<CompLayout />} />
         <Route path="/company/mcl-group" element={<FtHomeLayout />} />
         <Route path="/company/leadership" element={<LeadershipHomeLayout />} />
        <Route path="/company/diversity-and-inclusion" element={< DiversityAndInclusionLayout />} />
        <Route path="/company/sustainability" element={< SustainabilityLayout />} />
         <Route path="/company/giving-back" element={< GivingBackLayout />} />
         <Route path="/company/pink-130" element={< Pink130Layout />} />
         <Route path="/company/our-standards" element={< OurStandardsLayout />} />
         <Route path="/company/services" element={<  ServicesLayout />} />
          <Route path="/company/news" element={<  NewsHomeLayout />} />
          <Route path="/company/contact-us" element={<  ContactLayout />} />
           <Route path="/careers/what-we-do" element={< WhaatWeDoLayout />} />
            <Route path="/careers/mcl-blog" element={< LifeAtBlogLayout />} />
             <Route path="/careers/benefits" element={< BenefitiesLayout />} />
              <Route path="/careers/values" element={< ValuesLayout />} />
              <Route path="/careers/early-careers" element={< EaryCareerLayout />} />
               <Route path="/careers/stay-connected" element={< StayCoonnectedLayout />} />\
               <Route path="/our-brands" element={<OurBrands />}/>
               <Route path="/all-events" element={<EventsLayouts />}/>
               
              
                
          <Route path="/sign-in" element={<SignIn />} />
         
          <Route path="/reset-password" element={<ResetPass />} />
          <Route path="/request-for/reset-password" element={<RequestForResetPass/>} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />

          
        </Routes>
      </Router>
    </>
  );
}
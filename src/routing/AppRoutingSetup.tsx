import { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { DefaultPage } from '@/pages/dashboards';
import { UserPage, DevicePage } from '@/pages/account';
import { AuthPage } from '@/auth';
import { RequireAuth } from '@/auth/RequireAuth';
import { Demo1Layout } from '@/layouts/demo1';
import { ErrorsRouting } from '@/errors';
import { Organisations } from '@/pages/organisations/organisations-main';
import { OrganisationsDetail } from '@/pages/organisations';
import { AccountUserProfilePage } from '@/pages/user-profile';
import { Setting } from '@/pages/setting';
import Success from '@/pages/subscriber/success';
import Cancel from '@/pages/subscriber/Cancel';
import { SubscriberPlans } from '@/pages/subscriber';
import ProtectedRoute from './ProtectedRoute';

const AppRoutingSetup = (): ReactElement => {
  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route element={<ProtectedRoute />}>
          <Route element={<Demo1Layout />}>
            <Route path="/dashboard" element={<DefaultPage />} />
            <Route path="/" element={<DefaultPage />} />
            <Route path="/user" element={<UserPage />} />
            <Route path="/device" element={<DevicePage />} />
            <Route path="/subscription" element={<SubscriberPlans />} />
            <Route path="/setting" element={<Setting />} />
            <Route path="/user-profile" element={<AccountUserProfilePage />} />
            <Route path="/success" element={<Success />} />
            <Route path="/cancel" element={<Cancel />} />

            {/* <Route path="/account/members/teams" element={<AccountTeamsPage />} /> */}
            {/* <Route path="/device" element={<Teams />} /> */}
          </Route>
        </Route>
      </Route>
      <Route path="/organisations-step-1" element={<Organisations />} />
      <Route path="/organisations-step-2" element={<OrganisationsDetail />} />
      <Route path="error/*" element={<ErrorsRouting />} />
      <Route path="auth/*" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/error/404" />} />
    </Routes>
  );
};

export { AppRoutingSetup };

import { Navigate, RouteProps } from 'react-router-dom'
import { RoutePath } from './path'
import { HomePage } from '../pages/index'
import { DraftsPage } from '../pages/messages/drafts'
import { NewMessagePage } from '../pages/message/edit'
import { SentPage } from '../pages/messages/sent'
import { SettingsAddressPage } from '../pages/settings/address'
import { SettingsAvatarPage } from '../pages/settings/avatar'
import { SettingsSignaturePage } from '../pages/settings/signature'
import { SetupAddressPage } from '../pages/setup/address'
import { SetupAvatarPage } from '../pages/setup/avatar'
import { SetupSharePage } from '../pages/setup/share'
import { UnReadPage } from '../pages/unread'
import { MessagePage } from '../pages/message/[id]'
import { TrashPage } from '../pages/messages/trash'
import { SpamPage } from '../pages/messages/spam'
import { SetupSignaturePage } from '../pages/setup/signature'
import { Developers } from '../pages/developers'
import { SubscribePage } from '../pages/subscribe'
import { SubPage } from '../pages/subscription/index'
import { SubPreviewPage } from '../pages/subscription/preview'

interface Mail3RouterProps extends RouteProps {
  key: string
  params?: string
  path: string
}

export const routes: Mail3RouterProps[] = [
  {
    path: RoutePath.Home,
    key: 'home',
    element: <HomePage />,
  },
  {
    path: RoutePath.Drafts,
    key: 'drafts',
    element: <DraftsPage />,
  },
  {
    path: RoutePath.Message,
    key: 'message',
    params: '/:id',
    element: <MessagePage />,
  },
  {
    path: RoutePath.Sent,
    key: 'sent',
    element: <SentPage />,
  },
  {
    path: RoutePath.Trash,
    key: 'trash',
    element: <TrashPage />,
  },
  {
    path: RoutePath.Spam,
    key: 'spam',
    element: <SpamPage />,
  },
  {
    path: RoutePath.Settings,
    key: 'settings',
    element: <SettingsAddressPage />,
  },
  {
    path: RoutePath.SettingAvatar,
    key: 'settings-avatar',
    element: <SettingsAvatarPage />,
  },
  {
    path: RoutePath.SettingSignature,
    key: 'settings-signature',
    element: <SettingsSignaturePage />,
  },
  {
    path: RoutePath.Setup,
    key: 'setup',
    element: <SetupAddressPage />,
  },
  {
    path: RoutePath.SetupSignature,
    key: 'setup-signature',
    element: <SetupSignaturePage />,
  },
  {
    path: RoutePath.SetupShare,
    key: 'setup-share',
    element: <SetupSharePage />,
  },
  {
    path: RoutePath.SetupAvatar,
    key: 'setup-avatar',
    element: <SetupAvatarPage />,
  },
  {
    path: RoutePath.NewMessage,
    key: 'new-message',
    element: <NewMessagePage />,
  },
  {
    path: RoutePath.Developers,
    key: 'developers',
    element: <Developers />,
  },
  {
    path: RoutePath.Subscription,
    key: 'subscription',
    element: <SubPage />,
  },
  {
    path: RoutePath.Subscription,
    key: 'subscription-deatail',
    params: '/:id',
    element: <SubPreviewPage />,
  },
  {
    path: RoutePath.Unread,
    key: 'unread',
    element: <UnReadPage />,
  },
  {
    path: `${RoutePath.Subscribe}/:id`,
    key: 'Subscribe',
    element: <SubscribePage />,
  },
  {
    path: RoutePath.Testing,
    key: 'testing',
    element: <Navigate to={RoutePath.Inbox} />,
  },
]

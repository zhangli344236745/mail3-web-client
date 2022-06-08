import React, { useEffect, useMemo, useState } from 'react'
import type { GetServerSideProps, NextPage } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { CONTAINER_MAX_WIDTH } from 'ui'
import { Box } from '@chakra-ui/react'
import { SubmitMessage } from 'models/src/submitMessage'
import { useAtom } from 'jotai'
import { SignatureStatus } from 'hooks'
import { useQuery } from 'react-query'
import { AxiosResponse } from 'axios'
import { MessageEditor } from '../../components/MessageEditor'
import { Navbar } from '../../components/Navbar'
import { useSubject } from '../../components/MessageEditor/hooks/useSubject'
import { getAuthenticateProps, userPropertiesAtom } from '../../hooks/useLogin'
import {
  AttachmentExtraInfo,
  useAttachment,
} from '../../components/MessageEditor/hooks/useAttachment'
import { useAPI } from '../../hooks/useAPI'
import { convertBlobToBase64 } from '../../utils/file'
import { useSaveMessage } from '../../components/MessageEditor/hooks/useSaveMessage'

function getDefaultTemplate(content: string) {
  return `<p>
<br/>
<br/>
<br/>
${content}
</p>`
}

function getReplyTemplate(content: string, signContent: string) {
  return getDefaultTemplate(`<blockquote style="border-left: 2px solid #6f6f6f; background-color: #f7f7f7; padding: 16px 20px">
${content}
</blockquote>
<br/>
<br/>
${signContent}`)
}

function getForwardTemplate(content: string, signContent: string) {
  return getDefaultTemplate(`<blockquote style="background-color: #f7f7f7; padding: 16px 20px">
<p>---------- Forwarded message ---------</p>
${content}
</blockquote>
<br/>
<br/>
${signContent}
`)
}

interface ServerSideProps {
  action: SubmitMessage.ReferenceAction | null
  id: string | null
}

export const getServerSideProps: GetServerSideProps<ServerSideProps> =
  getAuthenticateProps(async ({ locale, query }) => ({
    props: {
      ...(await serverSideTranslations(locale as string, [
        'edit-message',
        'connect',
        'common',
      ])),
      action: query.action ? query.action : null,
      id: query.id ? query.id : null,
    },
  }))

const NewMessagePage: NextPage<ServerSideProps> = ({ action, id }) => {
  const api = useAPI()
  const [userProperties] = useAtom(userPropertiesAtom)
  const signatureStatus = userProperties?.signature_status as SignatureStatus
  const isEnableSignatureText =
    signatureStatus === SignatureStatus.OnlyText ||
    signatureStatus === SignatureStatus.BothEnabled
  const queryMessageInfoAndContentData = useQuery(
    ['INIT_EDIT_MESSAGE_QUERY'],
    async () => {
      function apiHandle<T>(p: Promise<AxiosResponse<T>>) {
        return p.then((r) => r.data).catch(() => null)
      }
      const messageInfo = id
        ? await apiHandle(api.getMessageInfo(id as string))
        : null
      const messageContent = messageInfo?.text.id
        ? await apiHandle(api.getMessageContent(messageInfo?.text.id))
        : null
      const userInfo = isEnableSignatureText
        ? await apiHandle(api.getUserInfo())
        : null

      return {
        messageInfo,
        messageContent,
        userInfo,
      }
    },
    {
      enabled: !!id,
      refetchOnReconnect: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      retry: false,
    }
  )
  const messageInfo = queryMessageInfoAndContentData?.data?.messageInfo
  const messageContent = queryMessageInfoAndContentData?.data?.messageContent
  const userInfo = queryMessageInfoAndContentData?.data?.userInfo

  const defaultContent = useMemo(() => {
    const signContent =
      isEnableSignatureText && userInfo ? userInfo.text_signature : ''
    if (!messageContent) {
      return getDefaultTemplate(signContent)
    }
    if (action === 'forward') {
      return getForwardTemplate(messageContent.html, signContent)
    }
    if (action === 'reply') {
      return getReplyTemplate(messageContent.html, signContent)
    }
    return messageContent.html
  }, [messageContent, action, isEnableSignatureText, userInfo])
  const [isLoadedSubjectInfo, setIsLoadingSubjectInfo] = useState(false)
  const {
    setSubject,
    setToAddresses,
    setCcAddresses,
    setBccAddresses,
    setFromAddress,
    onReset,
  } = useSubject()
  const { setAttachmentExtraInfo, setAttachments, onResetAttachments } =
    useAttachment()
  const { onResetSavingAtom } = useSaveMessage()
  const getSubject = () => {
    if (!messageInfo) return ''
    if (
      (messageInfo.subject.startsWith('Fwd:') && action === 'forward') ||
      (messageInfo.subject.startsWith('Re:') && action === 'reply')
    ) {
      return messageInfo.subject
    }
    if (action === 'forward' && messageInfo.subject.startsWith('Re:')) {
      return `Fwd:${messageInfo.subject.substring(3)}`
    }
    if (action === 'reply' && messageInfo.subject.startsWith('Fwd:')) {
      return `Re:${messageInfo.subject.substring(4)}`
    }
    return messageInfo.subject
  }
  useEffect(() => {
    if (isLoadedSubjectInfo) return
    onReset()
    onResetAttachments()
    onResetSavingAtom()
    setIsLoadingSubjectInfo(true)
    if (!messageInfo) return
    setSubject(getSubject())
    if (messageInfo.to) {
      setToAddresses(messageInfo.to.map((item) => item.address))
    }
    if (messageInfo.cc) {
      setCcAddresses(messageInfo.cc.map((item) => item.address))
    }
    if (messageInfo.bcc) {
      setBccAddresses(messageInfo.bcc.map((item) => item.address))
    }
    if (messageInfo.from) {
      setFromAddress(messageInfo.from.address)
    }
    ;(async () => {
      if (!messageInfo.attachments) return
      setAttachments(
        messageInfo.attachments.map((a) => ({
          filename: a.filename,
          contentType: a.contentType,
          cid: a.contentId,
          content: '',
          contentDisposition: a.inline ? 'inline' : 'attachment',
        }))
      )
      setAttachmentExtraInfo(
        messageInfo.attachments.reduce<{ [key: string]: AttachmentExtraInfo }>(
          (acc, cur) => ({ ...acc, [cur.contentId]: { downloadProgress: 0 } }),
          {}
        )
      )
      await Promise.all(
        messageInfo.attachments.map((attachment, i) =>
          api
            .downloadAttachment(messageInfo.id, attachment.id)
            .then((res) => convertBlobToBase64(res.data))
            .then((base64) => {
              setAttachmentExtraInfo((o) => ({
                ...o,
                [attachment.contentId]: { downloadProgress: 1 },
              }))
              setAttachments((a) => {
                // eslint-disable-next-line no-param-reassign
                a[i].content = base64
                return a.concat([])
              })
            })
        )
      )
    })()
  }, [])
  return (
    <Box
      maxW={`${CONTAINER_MAX_WIDTH}px`}
      px={{
        base: '0',
        md: '20px',
      }}
      mx="auto"
    >
      <Box
        w="full"
        px={{
          base: '20px',
          md: '0',
        }}
      >
        <Navbar />
      </Box>
      <MessageEditor
        defaultContent={defaultContent}
        isEnableCardSignature={
          signatureStatus === SignatureStatus.OnlyImage ||
          signatureStatus === SignatureStatus.BothEnabled
        }
        isLoading={queryMessageInfoAndContentData.isLoading}
      />
    </Box>
  )
}

export default NewMessagePage

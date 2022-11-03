import { AddIcon, ChevronRightIcon } from '@chakra-ui/icons'
import {
  Box,
  Center,
  Heading,
  Input,
  InputGroup,
  Spinner,
  Text,
} from '@chakra-ui/react'
import styled from '@emotion/styled'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from 'ui'
import { useForm, UseFormRegisterReturn } from 'react-hook-form'
import { useDialog } from 'hooks'
import { useNavigate } from 'react-router-dom'
import { useAtomValue } from 'jotai'
import { isEthAddress, isPrimitiveEthAddress, truncateMiddle } from 'shared'
import { useQuery } from 'react-query'
import { RoutePath } from '../../route/path'
import { useAPI, useHomeAPI } from '../../hooks/useAPI'
import { userPropertiesAtom } from '../../hooks/useLogin'

type FileUploadProps = {
  register: UseFormRegisterReturn
  accept?: string
  multiple?: boolean
}

interface SettingAvatarProps {
  isSetup?: boolean
}

type FormValues = {
  file_: FileList
  nickname: string
}

const Container = styled(Box)``

const FileUpload: React.FC<FileUploadProps> = (props) => {
  const { register, accept, multiple, children } = props
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { ref, ...rest } = register as {
    ref: (instance: HTMLInputElement | null) => void
  }

  const handleClick = () => inputRef.current?.click()

  return (
    <InputGroup onClick={handleClick}>
      <input
        type="file"
        multiple={multiple || false}
        hidden
        accept={accept}
        {...rest}
        ref={(e) => {
          ref(e)
          inputRef.current = e
        }}
      />
      {children}
    </InputGroup>
  )
}

const validateFiles = (value: FileList) => {
  if (value.length < 1) {
    return 'Files is required'
  }
  // eslint-disable-next-line no-restricted-syntax
  for (const file of Array.from(value)) {
    const fsMb = file.size / (1024 * 1024)
    const MAX_FILE_SIZE = 2
    if (fsMb > MAX_FILE_SIZE) {
      return 'Max file size 2mb'
    }
  }
  return false
}

export const SettingAvatar: React.FC<SettingAvatarProps> = ({ isSetup }) => {
  const [t] = useTranslation('settings')
  const { register, handleSubmit, watch, setValue } = useForm<FormValues>()
  const [isUpLoading, setIsUpLoading] = useState(false)
  const [isSaveLoading, setIsSaveLoading] = useState(false)
  const [disable, setDisable] = useState(true)
  const homeAPI = useHomeAPI()
  const api = useAPI()
  const dialog = useDialog()
  const navi = useNavigate()
  const [avatarSrc, setAvatarSrc] = useState(
    'https://mail-public.s3.amazonaws.com/users/default_avatar.png'
  )
  const userProps = useAtomValue(userPropertiesAtom)

  const { isLoading, data: info } = useQuery(
    ['settingAvatar'],
    async () => {
      const { data } = await api.getUserInfo()
      return data
    },
    {
      refetchOnMount: true,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      onSuccess(d) {
        setAvatarSrc(d.avatar)
        setValue('nickname', d.nickname)
      },
    }
  )

  const onSubmit = handleSubmit(async (data) => {
    if (!/^[0-9a-zA-Z_]{1,16}$/.test(data.nickname)) {
      dialog({
        type: 'warning',
        description: 'Invalid nickname',
      })
      return
    }
    setIsSaveLoading(true)
    try {
      await api.setProfile(data.nickname, avatarSrc)
      dialog({
        type: 'success',
        description: 'Settings are saved',
      })
    } catch (error) {
      dialog({
        type: 'warning',
        description: 'Network error',
      })
    }
    setIsSaveLoading(false)
  })

  useEffect(() => {
    if (isLoading) {
      return
    }
    if (info?.nickname) {
      return
    }
    if (userProps?.defaultAddress) {
      const address = userProps.defaultAddress.split('@')[0]
      let defaultNickname = 'nickname'
      if (isPrimitiveEthAddress(address)) {
        defaultNickname = truncateMiddle(address, 6, 4, '_')
      } else if (isEthAddress(address)) {
        defaultNickname = address.includes('.')
          ? address.split('.')[0]
          : address
      }
      setValue('nickname', defaultNickname)
    }
  }, [userProps, isLoading, info])

  useEffect(() => {
    const watchFile = watch(async (value, { name }) => {
      if (name === 'nickname') {
        if (value.nickname?.length || value.nickname === info?.nickname) {
          setDisable(false)
        } else {
          setDisable(true)
        }
      }

      if (name === 'file_' && value.file_ && value.file_.length > 0) {
        setIsUpLoading(true)
        try {
          const file = value.file_
          const check = validateFiles(file)
          if (check) {
            dialog({
              type: 'warning',
              description: check,
            })
            throw check
          }
          const { data } = await homeAPI.uploadImage(file[0])
          setAvatarSrc(data.url)
          setDisable(false)
        } catch (error) {
          console.error(error)
        }
        setIsUpLoading(false)
      }
    })
    return () => watchFile.unsubscribe()
  }, [watch, info])

  return (
    <Container>
      {isSetup ? (
        <Center
          position="relative"
          w="100%"
          mb="20px"
          mt={['20px', '20px', '40px']}
        >
          <Heading fontSize={['20px', '20px', '28px']}>
            {t('setup.avatar.title')}
          </Heading>

          <Button
            bg="black"
            color="white"
            flex="1"
            className="next-header"
            position="absolute"
            onClick={() => {
              if (!disable) {
                // onsubmit
                // navi
                return
              }
              navi(RoutePath.SetupSignature)
            }}
            right="60px"
            _hover={{
              bg: 'brand.50',
            }}
            rightIcon={<ChevronRightIcon color="white" />}
          >
            <Center flexDirection="column">
              <Text>{t('setup.next')}</Text>
            </Center>
          </Button>
        </Center>
      ) : null}

      {isLoading ? (
        <Center minH="300px">
          <Spinner />
        </Center>
      ) : (
        <Center flexDirection="column" justifyContent="center">
          <Box>
            <Input
              placeholder="Nickname"
              background="#F4F4F4"
              border="1px solid #000000"
              borderRadius="100px"
              fontWeight="500"
              fontSize="20px"
              lineHeight="30px"
              p="6px"
              textAlign="center"
              color="#000"
              minW="300px"
              maxW="375px"
              _placeholder={{ color: 'rgba(0, 0, 0, 0.4)' }}
              {...register('nickname')}
            />
          </Box>
          <Box color="#6F6F6F" fontSize="14px" mt="3px" textAlign="center">
            Need contain 1 to 16 numbers or letters and cannot contain special
            symbols or emoji
          </Box>

          <Center
            w="95%"
            border="1px solid #E7E7E7"
            borderRadius="24px"
            flexDirection="column"
            justifyContent="center"
            p="24px"
            mt="24px"
          >
            <Box
              w="150px"
              h="150px"
              border="4px solid #000000"
              borderRadius="100px"
              bgImage={avatarSrc}
              bgRepeat="no-repeat"
              bgPosition="center"
              bgSize="100% auto"
            />

            <Box mt="16px">
              <FileUpload
                accept=".jpg, .jpeg, .gif, .png, .bmp"
                register={register('file_')}
              >
                <Button
                  leftIcon={<AddIcon />}
                  variant="outline"
                  fontSize="12px"
                  loadingText="Uploading"
                  isLoading={isUpLoading}
                >
                  Upload image
                </Button>
              </FileUpload>
            </Box>

            <Box color="#6F6F6F" fontSize="14px" mt="6px" textAlign="center">
              Image format only: BMP, JPEG, JPG, GIF, PNG, size not more than 2M
            </Box>
          </Center>
          {!isSetup ? (
            <Box mt="24px">
              <Button
                w="120px"
                onClick={onSubmit}
                disabled={disable}
                isLoading={isSaveLoading}
              >
                Save
              </Button>
            </Box>
          ) : null}
        </Center>
      )}
    </Container>
  )
}

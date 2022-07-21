/* eslint-disable no-nested-ternary */
import {
  Center,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Link,
  Spinner,
  Stack,
  Switch,
  Text,
  Tooltip,
  VStack,
  Icon,
  Button as RowButton,
  Box,
  Spacer,
} from '@chakra-ui/react'
import styled from '@emotion/styled'
import {
  ChevronRightIcon,
  CheckCircleIcon,
  QuestionOutlineIcon,
} from '@chakra-ui/icons'
import { useUpdateAtom } from 'jotai/utils'
import { useTranslation, Trans } from 'react-i18next'
import React, { useMemo, useState } from 'react'
import { Button } from 'ui'
import {
  useAccount,
  useDialog,
  useToast,
  useTrackClick,
  TrackEvent,
} from 'hooks'
import { useLocation } from 'react-router-dom'
import { useQuery } from 'react-query'
import {
  truncateMiddle,
  isPrimitiveEthAddress,
  isEnsDomain,
  isBitDomain,
} from 'shared'
import { useAPI } from '../../hooks/useAPI'
import { Query } from '../../api/query'
import happySetupMascot from '../../assets/happy-setup-mascot.png'
import { ReactComponent as RefreshSvg } from '../../assets/refresh.svg'
import { ReactComponent as ArrawSvg } from '../../assets/setup/arrow.svg'
import { RoutePath } from '../../route/path'
import { Mascot } from './Mascot'
import { IS_IPHONE, MAIL_SERVER_URL } from '../../constants'
import { userPropertiesAtom } from '../../hooks/useLogin'
import { Alias } from '../../api'
import { RouterLink } from '../RouterLink'

const Container = styled(Center)`
  flex-direction: column;
  width: 100%;

  .header {
    margin-bottom: 32px;
    text-align: center;
  }

  .mascot {
    bottom: 0;
    // 240 = content width / 2
    // 164 = mascot width
    // 20 = gutter
    right: calc(50% - 240px - 164px - 20px);
    z-index: 1;
    position: absolute;

    @media (max-width: 930px) {
      position: static;
      bottom: 50px;
    }
  }

  .footer {
    display: none;
    @media (max-width: 930px) {
      display: flex;
      margin-top: 10px;
    }
  }

  .switch-wrap {
    background: rgba(243, 243, 243, 0.5);
    border: 1px solid #e7e7e7;
    border-radius: 16px;
    overflow: hidden;
  }
`

interface EmailSwitchProps {
  emailAddress: string
  account: string
  isLoading?: boolean
  uuid: string
  isChecked: boolean
  address: string
  // eslint-disable-next-line prettier/prettier
  onChange: (uuid: string, address: string) => (e: React.ChangeEvent<HTMLInputElement>) => void
}

const EmailSwitch: React.FC<EmailSwitchProps> = ({
  emailAddress,
  onChange,
  isLoading = false,
  isChecked,
  address,
  uuid,
}) => (
  <Flex
    justifyContent="space-between"
    // boxShadow={
    //   isChecked ? `0px 0px 10px 4px rgba(25, 25, 100, 0.1)` : undefined
    // }
    borderRadius="8px"
    border={isChecked ? '1px solid #4E52F5' : '1px solid #e7e7e7'}
    padding="10px 16px 10px 16px"
    w="100%"
  >
    <Text fontSize="14px">{emailAddress}</Text>
    {isLoading ? (
      <Spinner />
    ) : IS_IPHONE ? (
      <Switch
        colorScheme="deepBlue"
        isReadOnly={isChecked}
        isChecked={isChecked}
        onChange={onChange(uuid, address)}
      />
    ) : (
      <>
        <Switch
          colorScheme="deepBlue"
          isReadOnly={isChecked}
          isChecked={isChecked}
          onChange={onChange(uuid, address)}
          display={['none', 'none', 'block']}
        />
        <Checkbox
          colorScheme="deepBlue"
          isReadOnly={isChecked}
          top="2px"
          isChecked={isChecked}
          onChange={onChange(uuid, address)}
          display={['block', 'block', 'none']}
        />
      </>
    )}
  </Flex>
)

const generateEmailAddress = (s = '') => {
  const [address, rest] = s.split('@')
  if (isPrimitiveEthAddress(address))
    return `${truncateMiddle(address, 6, 4)}@${
      rest || MAIL_SERVER_URL
    }`.toLowerCase()

  return s
}

const ENS_DOMAIN = 'https://app.ens.domains'
const BIT_DOMAIN = 'https://www.did.id/'

enum AliasType {
  ENS = 'ENS',
  BIT = 'BIT',
}

const LIMIT_MAX_NUMBER = 5

export const SettingAddress: React.FC = () => {
  const [t] = useTranslation('settings')
  const router = useLocation()
  const account = useAccount()
  const api = useAPI()
  const toast = useToast()
  const dialog = useDialog()
  const trackClickENSRefresh = useTrackClick(TrackEvent.ClickENSRefresh)
  const trackClickBITRefresh = useTrackClick(TrackEvent.ClickBITRefresh)
  const setUserProperties = useUpdateAtom(userPropertiesAtom)
  const trackClickRegisterENS = useTrackClick(TrackEvent.ClickRegisterENS)
  const trackNext = useTrackClick(TrackEvent.ClickAddressNext)

  const [activeAccount, setActiveAccount] = useState(account)
  const [isRefreshingMap, setIsRefeshingMap] = useState({
    [AliasType.BIT]: false,
    [AliasType.ENS]: false,
  })
  const [isOpenMoreMap, setIsOpenMoreMap] = useState({
    [AliasType.BIT]: false,
    [AliasType.ENS]: false,
  })

  const {
    data: aliasDate,
    isLoading,
    refetch,
  } = useQuery(
    [Query.Alias, account],
    async () => {
      let { data } = await api.getAliases()
      data = {
        aliases: [
          {
            uuid: 'b951c1c8-c394-49af-ae9b-d7a73556b9c8',
            address: '0x17EFDCcfc61a03aE6620F35e502215edde20c13d@imibao.net',
            is_default: false,
          },
          {
            uuid: '86ce46b9-d30e-4420-83f9-2170c7604ce3',
            address: 'horong.eth@imibao.net',
            is_default: false,
          },
          {
            uuid: '86ce46b9-d30e-4420-83f9-2170c76042ce3',
            address: 'horong.eth@imibao.net',
            is_default: false,
          },
          {
            uuid: '86ce46b9-d30e-4420-83f9-2170c76041ce3',
            address: 'horong.eth@imibao.net',
            is_default: false,
          },
          {
            uuid: '86ce46b9-d30e-4420-83f9-2170c76043ce3',
            address: 'horong.eth@imibao.net',
            is_default: false,
          },
          {
            uuid: '86ce46b9-d30e-4420-83f9-2170c72604ce3',
            address: 'horong.eth@imibao.net',
            is_default: false,
          },
          {
            uuid: '86ce46b9-d30e-4420-83f9-21720c7604ce3',
            address: 'horong.eth@imibao.net',
            is_default: false,
          },
          {
            uuid: '1e7c6caa-2123c176-4012-8a39-de4ee14d8f48',
            address: 'horong007.bit@imibao.net',
            is_default: true,
          },
          {
            uuid: '1e7c6caa213-c176-4012-8a39-de4ee14d8f48',
            address: 'horong007.bit@imibao.net',
            is_default: false,
          },
          {
            uuid: '1e7c26caa-c176-4012-8a39-de4ee14d8f48',
            address: 'horong007.bit@imibao.net',
            is_default: false,
          },
          {
            uuid: '1e7c6caa-c176-4012-21a39-de4ee14d8f48',
            address: 'horong007.bit@imibao.net',
            is_default: false,
          },
          {
            uuid: '1e7c6caa-c176-4012-8a39-de4ee14d8f48',
            address: 'horong007.bit@imibao.net',
            is_default: false,
          },
          {
            uuid: '1e7c6caa-c176-4012-8a39-de4ee414d8f48',
            address: 'horong007.bit@imibao.net',
            is_default: false,
          },
          {
            uuid: '1e7c6caa-c176-4012-8a239-de4ee14d8f48',
            address: 'horong007.bit@imibao.net',
            is_default: false,
          },
          {
            uuid: '1e7c6caa-c176-4012-81a39-de4ee14d8f48',
            address: 'horong007.bit@imibao.net',
            is_default: false,
          },
          {
            uuid: '1e7c6ca1a-c176-4012-8a39-de4ee14d8f48',
            address: 'horong007.bit@imibao.net',
            is_default: false,
          },
          {
            uuid: '1e7c6caa-c176-4012-8a239-de4ee14d8f48',
            address: 'horong007.bit@imibao.net',
            is_default: false,
          },
        ],
      }

      return data
    },
    {
      enabled: !!account,
      refetchOnMount: true,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      onSuccess(d) {
        const defaultAlias: Alias =
          d.aliases.find((alias) => alias.is_default) || d.aliases[0]
        setActiveAccount(defaultAlias.uuid)
        setUserProperties((config) => ({
          ...config,
          aliases: d.aliases,
          defaultAddress: defaultAlias.address,
        }))
      },
    }
  )

  const onRefreshDomains = async (type: AliasType) => {
    setIsRefeshingMap((s) => ({
      ...s,
      [type]: true,
    }))
    try {
      if (type === AliasType.ENS) {
        trackClickENSRefresh()
        await api.updateAliasEnsList()
      }
      if (type === AliasType.BIT) {
        trackClickBITRefresh()
        await api.updateAliasBitList()
      }
      await refetch()
    } catch (e: any) {
      if (e.response.data.reason !== 'EMPTY_ENS_LIST') {
        toast(t('address.refresh_failed') + e.toString())
      }
    } finally {
      setIsRefeshingMap((s) => ({
        ...s,
        [type]: false,
      }))
    }
  }

  const setUserInfo = useUpdateAtom(userPropertiesAtom)
  const onDefaultAccountChange =
    (uuid: string, address: string) => async () => {
      const prevActiveAccount = activeAccount
      try {
        setActiveAccount(uuid)
        await api.setDefaultSentAddress(uuid)
        setUserInfo((prev) => ({
          ...prev,
          defaultAddress: address,
        }))
      } catch (error) {
        setActiveAccount(prevActiveAccount)
        dialog({
          type: 'warning',
          description: t('address.request-failed'),
        })
      }
    }

  const aliases = useMemo(() => {
    const aliasMap: {
      primitive: Alias | null
      ens: Alias[]
      bit: Alias[]
    } = {
      primitive: null,
      ens: [],
      bit: [],
    }

    if (aliasDate?.aliases) {
      aliasDate?.aliases.forEach((item) => {
        const [addr] = item.address.split('@')
        if (isBitDomain(addr)) {
          aliasMap.bit.push(item)
          return
        }
        if (isEnsDomain(addr)) {
          aliasMap.ens.push(item)
          return
        }
        if (isPrimitiveEthAddress(addr)) {
          aliasMap.primitive = item
        }
      })
      return aliasMap
    }

    return aliasMap
  }, [aliasDate])

  const { primitive: primitiveAlias } = aliases

  const ensAliases = isOpenMoreMap[AliasType.ENS]
    ? aliases.ens
    : aliases.ens.slice(0, LIMIT_MAX_NUMBER)
  const bitAliases = isOpenMoreMap[AliasType.BIT]
    ? aliases.bit
    : aliases.bit.slice(0, LIMIT_MAX_NUMBER)

  const getRefreshButton = (type: AliasType) => (
    <RowButton
      variant="link"
      colorScheme="deepBlue"
      leftIcon={<Icon as={RefreshSvg} w="14px" h="14px" />}
      onClick={() => onRefreshDomains(type)}
      isLoading={isRefreshingMap[type]}
      fontWeight="400"
      fontSize="16px"
    >
      {t('address.refresh')}
    </RowButton>
  )

  return (
    <Container pb={{ md: '100px', base: 0 }}>
      <header className="header">
        <Heading fontSize={['14px', '14px', '18px']}>
          {t('address.title')}
        </Heading>
        <Text fontSize={['14px', '14px', '18px']}>{t('address.desc')}</Text>
      </header>
      <FormControl maxW="480px">
        <FormLabel
          fontSize="16px"
          mb="8px"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          <Stack
            direction="row"
            spacing="16px"
            justifyContent="flex-start"
            alignItems="center"
          >
            <Text fontWeight={600} as="span">
              {`${t('address.wallet-address')}@${MAIL_SERVER_URL}`}
            </Text>
            <HStack spacing="4px">
              <CheckCircleIcon color="#4E52F5" w="12px" />
              <Text fontWeight={500} color="#4E52F5">
                {t('address.default')}
              </Text>
            </HStack>
            <Tooltip label={t('address.default-hover')}>
              <QuestionOutlineIcon cursor="pointer" w="16px" color="#4E52F5" />
            </Tooltip>
          </Stack>
        </FormLabel>
        {primitiveAlias ? (
          <EmailSwitch
            uuid={primitiveAlias.uuid ?? 'first_alias'}
            emailAddress={generateEmailAddress(
              primitiveAlias.address ?? account
            )}
            account={primitiveAlias.address}
            onChange={onDefaultAccountChange}
            key={primitiveAlias.address}
            address={primitiveAlias.address ?? account}
            isLoading={isLoading}
            isChecked={
              primitiveAlias.uuid === activeAccount ||
              aliasDate?.aliases?.length === 1
            }
          />
        ) : null}
        {ensAliases.length && !isLoading ? (
          <>
            <FormLabel fontSize="16px" fontWeight={700} mb="8px" mt="32px">
              <Stack
                direction="row"
                spacing="16px"
                justifyContent="flex-start"
                alignItems="center"
              >
                <Box h="24px" lineHeight="24px">
                  {t('address.ens-name')}
                </Box>
              </Stack>
            </FormLabel>
            <Box className="switch-wrap">
              <Box p="16px 8px 16px 8px">
                <VStack spacing="10px">
                  {ensAliases.map((a) => (
                    <EmailSwitch
                      uuid={a.uuid}
                      address={a.address}
                      emailAddress={generateEmailAddress(a.address)}
                      account={a.address}
                      onChange={onDefaultAccountChange}
                      key={a.address}
                      isChecked={a.uuid === activeAccount}
                    />
                  ))}
                </VStack>
                {aliases.ens.length > LIMIT_MAX_NUMBER &&
                !isOpenMoreMap[AliasType.ENS] ? (
                  <Center
                    cursor="pointer"
                    pt="8px"
                    fontSize="12px"
                    lineHeight="18px"
                    onClick={() => {
                      setIsOpenMoreMap({
                        ...isOpenMoreMap,
                        [AliasType.ENS]: true,
                      })
                    }}
                  >
                    <ArrawSvg />
                    <Box ml="2px">{` +${
                      aliases.ens.length - LIMIT_MAX_NUMBER
                    }`}</Box>
                  </Center>
                ) : null}
              </Box>
              <Flex h="44px" bg="#fff" p="0 18px">
                {getRefreshButton(AliasType.ENS)}
                <Spacer />
                <Center alignItems="center">
                  <Text fontSize="14px" fontWeight={500}>
                    <Stack
                      direction="row"
                      spacing="16px"
                      justifyContent="flex-start"
                      alignItems="center"
                    >
                      <Box>
                        <Trans
                          ns="settings"
                          i18nKey="address.register-ens"
                          t={t}
                          components={{
                            a: (
                              <Link
                                isExternal
                                onClick={() => trackClickRegisterENS()}
                                href={ENS_DOMAIN}
                                color="#4E52F5"
                              />
                            ),
                          }}
                        />
                      </Box>
                    </Stack>
                  </Text>
                </Center>
              </Flex>
            </Box>
          </>
        ) : null}

        {bitAliases.length && !isLoading ? (
          <>
            <FormLabel fontSize="16px" fontWeight={700} mb="8px" mt="32px">
              <Stack
                direction="row"
                spacing="16px"
                justifyContent="flex-start"
                alignItems="center"
              >
                <Box h="24px" lineHeight="24px">
                  {t('address.bit-name')}
                </Box>
              </Stack>
            </FormLabel>
            <Box className="switch-wrap">
              <Box p="16px 8px 16px 8px">
                <VStack spacing="10px">
                  {bitAliases.map((a) => (
                    <EmailSwitch
                      uuid={a.uuid}
                      address={a.address}
                      emailAddress={generateEmailAddress(a.address)}
                      account={a.address}
                      onChange={onDefaultAccountChange}
                      key={a.address}
                      isChecked={a.uuid === activeAccount}
                    />
                  ))}
                </VStack>
                {aliases.bit.length > LIMIT_MAX_NUMBER &&
                !isOpenMoreMap[AliasType.BIT] ? (
                  <Center
                    cursor="pointer"
                    pt="8px"
                    fontSize="12px"
                    lineHeight="18px"
                    onClick={() => {
                      setIsOpenMoreMap({
                        ...isOpenMoreMap,
                        [AliasType.BIT]: true,
                      })
                    }}
                  >
                    <ArrawSvg />
                    <Box ml="2px">{` +${
                      aliases.bit.length - LIMIT_MAX_NUMBER
                    }`}</Box>
                  </Center>
                ) : null}
              </Box>

              <Flex h="44px" bg="#fff" p="0 18px">
                {getRefreshButton(AliasType.BIT)}
                <Spacer />
                <Center alignItems="center">
                  <Text fontSize="14px" fontWeight={500}>
                    <Stack
                      direction="row"
                      spacing="16px"
                      justifyContent="flex-start"
                      alignItems="center"
                    >
                      <Box>
                        <Trans
                          ns="settings"
                          i18nKey="address.register-bit"
                          t={t}
                          components={{
                            a: (
                              <Link
                                isExternal
                                onClick={() => trackClickRegisterENS()}
                                href={BIT_DOMAIN}
                                color="#4E52F5"
                              />
                            ),
                          }}
                        />
                      </Box>
                    </Stack>
                  </Text>
                </Center>
              </Flex>
            </Box>
          </>
        ) : null}
      </FormControl>
      <Flex className="mascot">
        <Mascot src={happySetupMascot} />
      </Flex>
      {(router.pathname as any) !== RoutePath.Settings ? (
        <Center className="footer" w="full">
          <RouterLink href={RoutePath.SetupSignature} passHref>
            <Button
              bg="black"
              color="white"
              w="250px"
              height="50px"
              onClick={() => trackNext()}
              _hover={{
                bg: 'brand.50',
              }}
              as="a"
              rightIcon={<ChevronRightIcon color="white" />}
            >
              <Center flexDirection="column">
                <Text>{t('setup.next')}</Text>
              </Center>
            </Button>
          </RouterLink>
        </Center>
      ) : null}
    </Container>
  )
}

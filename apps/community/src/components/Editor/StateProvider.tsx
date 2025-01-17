import { Remirror, useRemirror } from '@remirror/react'
import {
  BoldExtension,
  ItalicExtension,
  PlaceholderExtension,
  UnderlineExtension,
  OrderedListExtension,
  BulletListExtension,
  StrikeExtension,
  LinkExtension,
} from 'remirror/extensions'
import { Box, BoxProps } from '@chakra-ui/react'
import { useCallback } from 'react'
import {
  CustomizedImageExtension,
  uploadHandlerFromHomeApi,
} from './Extensions/CustomizedImageExtension'
import { useHomeAPI } from '../../hooks/useHomeAPI'

export interface StateProviderProps extends BoxProps {
  content?: string
  placeholder?: string
  onChangeTextLengthCallback?: (textLength: number) => void
}

export const StateProvider: React.FC<StateProviderProps> = ({
  children,
  content = '',
  placeholder,
  onChangeTextLengthCallback,
  ...props
}) => {
  const homeApi = useHomeAPI()
  const extensions = useCallback(
    () => [
      new BoldExtension(),
      new ItalicExtension(),
      new UnderlineExtension(),
      new OrderedListExtension(),
      new BulletListExtension(),
      new StrikeExtension(),
      new PlaceholderExtension({ placeholder }),
      new LinkExtension(),
      new CustomizedImageExtension({
        enableResizing: true,
        uploadHandler: (files) => uploadHandlerFromHomeApi(files, homeApi),
      }),
    ],
    [placeholder]
  )
  const { manager, state } = useRemirror({
    extensions,
    content,
    selection: 'start',
    stringHandler: 'html',
  })
  return (
    <Remirror
      manager={manager}
      initialContent={state}
      onChange={({ helpers }) => {
        if (onChangeTextLengthCallback) {
          onChangeTextLengthCallback(helpers.getText().length)
        }
      }}
    >
      <Box {...props}>{children}</Box>
    </Remirror>
  )
}

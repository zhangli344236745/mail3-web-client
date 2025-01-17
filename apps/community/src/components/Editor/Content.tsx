import { Flex, FlexProps, useToken } from '@chakra-ui/react'
import { useRemirrorContext } from '@remirror/react'
import root from 'react-shadow'
import { forwardRef } from 'react'

// language=css
const style = (selectionBgColor: string) => `
* {
  font-size: 14px;
}
p {
  word-break: break-word;
  white-space: pre-line;
}
.content-container {
  display: flex;
}
.ProseMirror.remirror-editor, .content-container {
  flex: 1;
}
div:focus-visible {
  outline: none;
}
.remirror-is-empty:first-of-type::before {
  position: absolute;
  color: #aaa;
  pointer-events: none;
  height: 0;
  content: attr(data-placeholder);
}

::selection {
  color: #fff;
  background: ${selectionBgColor};
}
`

export const Content = forwardRef<HTMLDivElement, FlexProps>(
  ({ ...props }, ref) => {
    const { getRootProps } = useRemirrorContext({ autoUpdate: true })
    const primary900Color = useToken('colors', 'primary.900')
    return (
      <Flex
        flex={1}
        direction="column"
        css={`
          div {
            flex: 1;
            display: flex;
          }
        `}
        {...props}
      >
        <root.div ref={ref}>
          <style>{style(primary900Color)}</style>
          <div className="content-container" {...getRootProps()} />
        </root.div>
      </Flex>
    )
  }
)

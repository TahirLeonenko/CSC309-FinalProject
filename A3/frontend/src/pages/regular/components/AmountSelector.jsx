import { Flex, Input, NumberInput, Select } from '@mantine/core'
import React from 'react'

function AmountSelector({ operator, setOperator, amount, setAmount }) {
  return (
    <Input.Wrapper label="Amount">
      <NumberInput
        value={amount}
        onChange={(e) => setAmount(parseInt(e))}
        hideControls
        leftSection={
          <Select
            data={['<=', '>=']}
            value={operator}
            onChange={(e) => setOperator(e)}
            styles={{
              input: {
                border: 'none',
                borderRight: '1px solid var(--input-bd)',
                borderRadius: '0',
                background: 'transparent',
                paddingLeft: '25px',
                margin: '0',
              },
            }}
            w="100%"
          />
        }
        styles={{
          section: {
            width: '80px',
          },
          input: {
            paddingLeft: '90px',
          },
        }}
      />
    </Input.Wrapper>
  )
}

export default AmountSelector

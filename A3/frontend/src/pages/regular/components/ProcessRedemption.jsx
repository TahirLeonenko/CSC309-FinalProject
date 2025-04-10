import { SimpleGrid, Center } from '@mantine/core'
import React from 'react'
import QRCode from 'react-qr-code'

function ProcessRedemption({ transaction }) {
  return (
    <>
      {transaction && (
        <SimpleGrid cols={2}>
          <QRCode value={'transaction=' + transaction.id} size={'8rem'} />
          <Center>Have a cashier scan the QR code to process this redemption!</Center>
        </SimpleGrid>
      )}

      {!transaction && <Center>No transaction selected!</Center>}
    </>
  )
}

export default ProcessRedemption

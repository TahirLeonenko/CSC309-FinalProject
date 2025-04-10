import React from 'react';
import { Flex, TextInput, Select, Button, Box } from '@mantine/core';

const TransactionsFilters = ({
  nameInput,
  setNameInput,
  createdByInput,
  setCreatedByInput,
  suspiciousInput,
  setSuspiciousInput,
  promotionIdInput,
  setPromotionIdInput,
  typeInput,
  setTypeInput,
  relatedIdInput,
  setRelatedIdInput,
  amountInput,
  setAmountInput,
  operatorInput,
  setOperatorInput,
  handleApplyFilters,
}) => {
  return (
    <div className="filters-container">
      <Flex justify="space-between" align="flex-end" gap="md">
        <Flex align="center" gap="md" wrap="wrap" style={{ flex: 1 }}>
          <TextInput
            label="Search by UTORID or Name"
            placeholder="Enter name or UTORID"
            value={nameInput}
            onChange={(e) => setNameInput(e.currentTarget.value)}
            style={{ flex: 1, minWidth: 200 }}
          />

          <TextInput
            label="Created By (UTORID)"
            placeholder="Enter UTORID"
            value={createdByInput}
            onChange={(e) => setCreatedByInput(e.currentTarget.value)}
            style={{ flex: 1, minWidth: 200 }}
          />

          <Select
            label="Suspicious"
            placeholder="Any"
            data={[
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' },
            ]}
            value={suspiciousInput}
            onChange={(value) => setSuspiciousInput(value ?? '')}
            clearable
            style={{ flex: 1, minWidth: 120, maxWidth: 150 }}
          />

          <TextInput
            label="Promotion ID"
            placeholder="Any"
            value={promotionIdInput}
            onChange={(e) => setPromotionIdInput(e.currentTarget.value)}
            style={{ flex: 1, minWidth: 120, maxWidth: 150 }}
          />

          <Select
            label="Type"
            placeholder="All types"
            data={[
              { value: 'adjustment', label: 'Adjustment' },
              { value: 'transfer', label: 'Transfer' },
              { value: 'redemption', label: 'Redemption' },
              { value: 'event', label: 'Event' },
              { value: 'gift', label: 'Gift' },
              { value: 'purchase', label: 'Purchase' },
              // add other possible transaction types as needed
            ]}
            value={typeInput}
            onChange={(value) => setTypeInput(value ?? '')}
            clearable
            style={{ flex: 1, minWidth: 120, maxWidth: 150 }}
          />

          <TextInput
            label="Related ID"
            placeholder="Enter related ID"
            value={relatedIdInput}
            onChange={(e) => setRelatedIdInput(e.currentTarget.value)}
            style={{ flex: 1, minWidth: 120, maxWidth: 150 }}
          />

          <TextInput
            label="Amount"
            placeholder="Enter amount"
            value={amountInput}
            onChange={(e) => setAmountInput(e.currentTarget.value)}
            style={{ flex: 1, minWidth: 120, maxWidth: 150 }}
          />

          <Select
            label="Operator"
            placeholder="Operator"
            data={[
              { value: 'gte', label: '≥' },
              { value: 'lte', label: '≤' },
            ]}
            value={operatorInput}
            onChange={(value) => setOperatorInput(value ?? '')}
            clearable
            style={{ flex: 1, minWidth: 80, maxWidth: 120 }}
          />
        </Flex>

        <Box ml="md" style={{ display: 'flex', alignItems: 'flex-end' }}>
          <Button onClick={handleApplyFilters} size="md">Apply Filters</Button>
        </Box>
      </Flex>
    </div>
  );
};

export default TransactionsFilters;
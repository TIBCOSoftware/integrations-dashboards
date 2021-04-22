# integrations

## install the dependencies
```
cd selenium-regression-test-quote
npm install
```

## quote action test
We can do "submit for approval" or "recall approval" to a quote which is not Approval Required.

Parameters: quote ID, action ('submit' or 'recall'), owner ID
```
cd quote_action_test
node test_run quoteId, action, ownerId
Sample: node test_run a0p2g000001ZBOtAAO submit Renewals
```

## quote line test
We can edit lines (add or cancel a product). Then submit the quote for approval. Switch to approver account and approve this quote.

Parameters: quote ID, owner ID, approver ID, quantity, discount, license model
```
cd quote_line_test
node test_run quoteId ownerId approverId, quantity, discount, license_model
Sample: node test_run a0p2g000001ZD6FAAW 0051I000006lPqHQAU 0051I000001yEr7QAE 2 30 Subscription
```
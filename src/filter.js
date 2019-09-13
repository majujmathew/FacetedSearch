import 'modern-normalize'
import React, { Fragment, useState } from 'react'
import { render } from 'react-dom'
import faker from 'faker'

const filterKeys = ['color', 'material', 'department']

const initialFilterState = filterKeys.reduce(
  (collection, key) => ({
    ...collection,
    [key]: [],
  }),
  {}
)

const without = (obj, key) => {
  const { [key]: omit, ...foo } = obj
  return foo
}

const filterItems = (items, filter) => {
  const valueMap = {}
  const filteredItems = new Set()

  for (const item of items) {
    const allFilterMatches = []

    for (const filterAttribute in filter) {
      const filterValues = filter[filterAttribute]
      const matchesFilter =
        filterValues.length === 0 ||
        filterValues.includes(item[filterAttribute])

      allFilterMatches.push(matchesFilter)

      const filterWithoutThisFilterAttribute = without(filter, filterAttribute)

      const matchesOtherFilter = Object.entries(
        filterWithoutThisFilterAttribute
      ).every(
        ([key, values]) => values.length === 0 || values.includes(item[key])
      )

      if (matchesOtherFilter) {
        valueMap[filterAttribute] = valueMap[filterAttribute] || {}

        valueMap[filterAttribute][item[filterAttribute]] =
          valueMap[filterAttribute][item[filterAttribute]] || 0

        if (valueMap[filterAttribute][item[filterAttribute]] !== undefined) {
          valueMap[filterAttribute][item[filterAttribute]] += 1
        }
      }
    }

    if (allFilterMatches.every(Boolean)) {
      filteredItems.add(item)
    }
  }

  for (const filterAttribute in filter) {
    const filterValues = filter[filterAttribute]
    valueMap[filterAttribute] = valueMap[filterAttribute] || {}
    for (const value of filterValues) {
      valueMap[filterAttribute][value] = valueMap[filterAttribute][value] || 0
    }
  }

  return { filteredItems: [...filteredItems], valueMap }
}

const App = ({ items }) => {
  const [filter, setFilter] = useState(initialFilterState)

  const then = performance.now()
  const { filteredItems, valueMap } = filterItems(items, filter)
  console.log(
    `filtering ${items.length} items took ${(performance.now() - then).toFixed(
      2
    )}ms`
  )

  return (
    <div style={{ display: 'flex', padding: 10 }}>
      <div style={{ position: 'fixed', top: 0 }}>
        {filterKeys.map(key => (
          <Fragment key={key}>
            <div>{key}</div>
            <div
              style={{
                overflowY: 'auto',
                border: '1px solid #000',
                padding: 5,
                margin: 5,
                marginBottom: 20,
                height: '25vh',
              }}
            >
              {Object.entries(valueMap[key])
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([value, count]) => (
                  <label style={{ display: 'block' }} key={value}>
                    <input
                      name={key}
                      checked={filter[key].includes(value)}
                      type="checkbox"
                      onChange={({ target: { name, checked } }) =>
                        setFilter(filter => ({
                          ...filter,
                          [key]: checked
                            ? [...filter[key], value]
                            : filter[key].filter(v => v !== value),
                        }))
                      }
                    />
                    <span style={{ marginLeft: '1ch' }}>
                      {value} ({count})
                    </span>
                  </label>
                ))}
            </div>
          </Fragment>
        ))}
      </div>

      <div
        style={{
          flexGrow: 1,
          marginLeft: 200,
          display: 'grid',
          gridTemplateColumns: `repeat(${filterKeys.length + 1}, 1fr)`,
          gridTemplateRows: `repeat(${filteredItems.length}, 25px)`,
        }}
      >
        <div style={{ fontWeight: 'bold', marginLeft: 10 }}>name</div>
        {filterKeys.map(key => (
          <div key={key} style={{ fontWeight: 'bold', marginLeft: 10 }}>
            {key}
          </div>
        ))}

        {filteredItems.slice(0, 100).map(item => (
          <Fragment key={item.id}>
            <div
              style={{
                marginLeft: 10,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
            >
              {item.name}
            </div>
            {filterKeys.map(key => (
              <div key={key} style={{ marginLeft: 10 }}>
                {item[key]}
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  )
}

const items = []
for (var i = 0; i < 100; i++) {
  items.push({
    id: faker.random.uuid(),
    name: faker.commerce.productName(),
    color: faker.commerce.color(),
    material: faker.commerce.productMaterial(),
    department: faker.commerce.department(),
  })
}

render(<App items={items} />, root)

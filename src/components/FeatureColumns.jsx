export const FeatureColumns = ({ header = "Columns", children = [] }) => {
  return (
    <main>
      <div className="container px-4 py-5" id="featured-3">
        <h1 className="pb-2 border-bottom mb-4">{header}</h1>
        <div className="row row-cols-1 row-cols-lg-3">
          {children.map(
            (
              {
                content = (
                  <>
                    <p>
                      Paragraph of text beneath the heading to explain the
                      heading. We&apos;ll add onto it with another sentence and
                      probably just keep going until we run out of words.
                    </p>
                    <a className="icon-link" href="#">
                      Call to action
                      <svg className="bi">
                        <use xlinkHref="#chevron-right" />
                      </svg>
                    </a>
                  </>
                ),
                icon = (
                  <svg className="bi" height="1em" width="1em">
                    <use xlinkHref="#collection" />
                  </svg>
                ),
                title = "Featured title",
              },
              index
            ) => (
              <div className="feature col" key={index}>
                <h2 className="fs-2 text-body-emphasis d-flex align-items-center gap-2 mb-3">
                  {icon}
                  {title}
                </h2>
                {content}
              </div>
            )
          )}
        </div>
      </div>
    </main>
  );
};

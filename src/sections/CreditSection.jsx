import whistleIllustration from '../assets/whistle-illustration.svg'

const CreditSection = ({
  caption = 'These materials were created by the community for the community. Special thanks to @pilsenartscommunityhouse in Chicago for their generosity!',
  imageAlt = 'Woodcut illustration of a whistle'
}) => (
  <figure className="credit" aria-labelledby="credit-text">
    <img className="credit__image" src={whistleIllustration} alt={imageAlt} />
    <figcaption
      id="credit-text"
      className="body-medium roboto-400 text-center"
      dangerouslySetInnerHTML={{ __html: caption }}
    />
  </figure>
)

export default CreditSection

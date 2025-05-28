import testQuoteWhite from './Images/Test Quote White.png'
const TestimonialCards = ({ image, name, description }) => {
    return (
        <>
            <div className="card testimonialCard">
                <div className="row">

                    <div className="col-12 d-flex" >
                        <div className="col-6">
                            <img src={image} alt={name} className='nameImages' />
                        </div>
                        <div className="col-6">
                            <img src={testQuoteWhite} alt="" />
                            {/* <img src={commonImage} alt="" /> */}
                        </div>
                    </div>
                    <div className="col-12">
                        <h3 className='testimonialClientName'>{name}</h3>
                    </div>

                    <div className="col-12">
                        <p className='testimonialClientDesc'>{description}</p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default TestimonialCards

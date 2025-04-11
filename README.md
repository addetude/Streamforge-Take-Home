## Streamforge Take-Home Project - Adeline Lue Sang

# Algorithm Decisions
I decided to enhance the match score algorithm in two ways:

1) **Changing the weight of each individual score (e.g. community engagement) based on the user's campaign objective.** I felt this was an important addition to the algorithm, as a brand's campaign objective heavily alters what they want in a creator. For instance, a brand aiming to launch a product is going to place a higher importance on the relevance of the creator's content rather than the user's previous performance. Considering these factors, I created specific weighting systems for each campaign objective.

2) **Incorporating platform-specific score boosts.** I felt this addition was also very important due to the vastly different natures of each social media platform. For instance, something like Instagram has a strong visual appeal, making this platform ideal for a brand looking to launch a product. On the other hand, a platform like TikTok has high potential for viral videos, making it better for brands aiming for brand awareness. I strongly felt that each platform's unique strengths should be taken into consideration when determining a match score based on a campaign objective.

While I also considered implementing relevance decay into the algorithm to lower the scores of creators who have run too many campaigns recently, I felt I didn't want this to be reflected in the final match score. While a brand could be looking to work with a creator within the week, other brands could be simply looking to find creators to work with in the future. Because of this, I feel the score should be a reflection of how well the creator suits the brand overall, not just at one specific moment in time.

## Creator Card
For the creator card, I just wanted to display the most important information on the card in a visually appealing way. To accomplish this, I divided the card into a couple of sections: the header including information about the creator and their account (image, username, location, platform), the match score section that emphasizes how well the creator matches with the brand, the creator statistics (followers, engagement, hourly rate), and finally the categories of their content. I feel that by grouping like information together, it not only looks cleaner, but also is easier to follow.

## Optimizations and Improvements
I also added a couple of improvements that I felt would generally enhance users' experience on the application.

1) Ensuring all filtering was completed in the backend. Essentially, I had the filters be sent from front to backend, the actual filtering occurring in the backend, and then the list of the filtered creators being sent back to the frontend. This process is optimal, as it prevents extra or unnecessary data being sent between front and backend.

2) Moving the campaign settings component to the top of the page. I felt that the campaign settings should be the main focal point of the page, as this dictates the score of each creator. I felt that in its previous location, beneath the filtering sidebar, it was too difficult to access (e.g. having to scroll down quite far to access all the fields) and would generally lower the user's experience.

3) Adding the hourly cost of each creator as a sorting option. For brands on a stricter budget, this will be useful to find creators that are more realistic to work with.

4) Adding sliders and drop-down fields to the filter/campaign settings components. I feel that with these updated fields, it is easier for users to interact with the fields (e.g. less scrolling to access these fields) and allows them to view all important fields in one place. The slider can also make it easier for users to input their ideal lowest match score and I feel it will enhance user experience.

## Future UX Improvements
The biggest improvement that came to mind when working on this project was adding a page for each creator that can be accessed by clicking on their card. This way, brands looking to work with these creators can easily access more information about the creator, including (more specifically) what they do, their history, and more. Additionally, this page can display information that couldn't fit onto the creator card, including audience age and gender demographics. This page can also include information about how we calculated the match score (to give users more transparency) and possibly even incorporate the relevance decay concept by touching on the creator's past campaign timeline.

## Note
Just wanted to say a quick thank you to the Streamforge team for the opportunity to work on this project. I enjoyed taking on the challenge (even during finals season) and found myself learning a lot through it. Thank you!!!
